const express = require('express');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const { notifyTrip } = require('../services/notifications');
const { can } = require('../services/permissions');
const { loadMember, activeMembers } = require('../services/membership');

const router = express.Router();

let io;
router.setIO = (socketIO) => {
  io = socketIO;
};

// A split is between people who are actually on the trip: status 'active'
// and nothing else (R-F9).
async function activeMemberIds(trip) {
  const members = await activeMembers(trip._id);
  return members.filter((m) => m.userId).map((m) => m.userId);
}

// Load the trip and refuse unless the caller holds `capability` on it.
// Every decision here goes through can() — G5 · One helper.
async function loadTrip(req, res, capability = 'trip.view') {
  const trip = await Trip.findOne({ groupId: req.params.groupId });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return null;
  }
  const member = await loadMember(trip.groupId, req.user.uid);
  if (!can(member, trip, capability)) {
    if (!member || member.status !== 'active') {
      res.status(403).json({ error: 'You do not have access to this trip.' });
    } else {
      res.status(403).json({ error: 'You cannot do this on this trip.', capability });
    }
    return null;
  }
  trip.viewerMember = member;
  return trip;
}

// Net balance per user in cents: positive = is owed money, negative = owes money
function computeBalances(expenses) {
  const balances = {};
  for (const e of expenses) {
    const n = e.splitAmong.length;
    const base = Math.floor(e.amountCents / n);
    let remainder = e.amountCents - base * n;
    balances[e.paidBy] = (balances[e.paidBy] || 0) + e.amountCents;
    // Sorted so the extra cents land on the same people every time
    [...e.splitAmong].sort().forEach((uid) => {
      const share = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      balances[uid] = (balances[uid] || 0) - share;
    });
  }
  return balances;
}

// Greedy matching of debtors to creditors, minimising the number of transfers
function computeSettlements(balances) {
  const creditors = [];
  const debtors = [];
  for (const [userId, amount] of Object.entries(balances)) {
    if (amount > 0) creditors.push({ userId, amount });
    else if (amount < 0) debtors.push({ userId, amount: -amount });
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    transfers.push({ from: debtors[i].userId, to: creditors[j].userId, amountCents: amount });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }
  return transfers;
}

async function summary(trip) {
  const expenses = await Expense.find({ tripId: trip._id }).sort({ createdAt: -1 });
  const balances = computeBalances(expenses);
  return { expenses, balances, settlements: computeSettlements(balances) };
}

function broadcast(trip) {
  if (io) io.to(`trip:${trip.groupId}`).emit('expenses:changed', { groupId: trip.groupId });
}

// List expenses with balances and suggested settlements
router.get('/trip/:groupId', async (req, res) => {
  try {
    const trip = await loadTrip(req, res, 'trip.view');
    if (!trip) return;
    res.json(await summary(trip));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add an expense; amount is in major units (e.g. 12.50)
router.post('/trip/:groupId', async (req, res) => {
  try {
    const trip = await loadTrip(req, res, 'expense.create');
    if (!trip) return;

    const { description, amount, currency, paidBy, splitAmong } = req.body;
    const members = await activeMemberIds(trip);
    const amountCents = Math.round(Number(amount) * 100);

    if (typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (!Number.isFinite(amountCents) || amountCents < 1 || amountCents > 1e10) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    const payer = paidBy || req.user.uid;
    if (!members.includes(payer)) {
      return res.status(400).json({ error: 'Payer must be an active trip member' });
    }
    const participants = Array.isArray(splitAmong) && splitAmong.length ? [...new Set(splitAmong)] : members;
    if (!participants.every((uid) => members.includes(uid))) {
      return res.status(400).json({ error: 'All participants must be active trip members' });
    }

    await Expense.create({
      tripId: trip._id,
      groupId: trip.groupId,
      description: description.trim(),
      amountCents,
      currency: typeof currency === 'string' && currency.length === 3 ? currency : undefined,
      paidBy: payer,
      splitAmong: participants,
      createdBy: req.user.uid,
    });

    broadcast(trip);
    notifyTrip(trip, req.user.uid, {
      title: `New expense in ${trip.name}`,
      body: `${description.trim()} — ${(amountCents / 100).toFixed(2)}`,
    });
    res.status(201).json(await summary(trip));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an expense (creator or organizer)
router.delete('/trip/:groupId/:expenseId', async (req, res) => {
  try {
    const trip = await loadTrip(req, res, 'trip.view');
    if (!trip) return;

    const expense = await Expense.findOne({ _id: req.params.expenseId, tripId: trip._id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    // The CREATOR row: a guest may delete the expense they added, and no
    // other. Authorship is resolved after the capability check (§5.1 fn 2).
    if (!can(trip.viewerMember, trip, 'expense.delete', { resource: expense })) {
      return res.status(403).json({ error: 'You cannot delete this expense.', capability: 'expense.delete' });
    }

    await expense.deleteOne();
    broadcast(trip);
    res.json(await summary(trip));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.computeBalances = computeBalances;
router.computeSettlements = computeSettlements;

module.exports = router;
