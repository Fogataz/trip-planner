import { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import DestinationHeading from '../DestinationHeading'
import { TripMember, useTrip } from '../TripContext'
import { useOneShotIntent } from '../useOneShotIntent'

export default function Group() {
  const { t } = useTranslation()
  const { trip, refetch, apiUrl, token, currentUid, can, push } = useTrip()
  const groupId = trip.groupId

  // May the viewer remove THIS person? One capability, and "not myself".
  //
  // G1 · Last host is deliberately NOT re-decided here. Working out who the
  // last host is would mean reading roles in a component, which is how the
  // check drifts from the server (spec 011 risk 1) — the first version of this
  // line did exactly that and the G5 test caught it. The server refuses with
  // the way out named, and the handler below shows that message.
  const canRemove = (member: TripMember) =>
    can('member.remove') && !(member.userId && member.userId === currentUid)

  const intent = useOneShotIntent()
  const [showInviteForm, setShowInviteForm] = useState(intent === 'invite')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | null>(null)

  const handleRemoveMember = async (member: TripMember) => {
    if (!confirm(t('detail.confirmRemove', { name: member.email || t('detail.thisMember') }))) return
    try {
      await axios.delete(`${apiUrl}/api/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
        data: member.userId ? { userId: member.userId } : { email: member.email },
      })
      refetch()
    } catch (err: any) {
      alert(t('common.errorPrefix', { message: err.response?.data?.error || t('detail.removeFailed') }))
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    try {
      const response = await axios.post(
        `${apiUrl}/api/groups/${groupId}/members`,
        { email: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setInviteToken(response.data.invitation?.token)
      setInviteEmail('')
      refetch()
    } catch (err: any) {
      alert(t('common.errorPrefix', { message: err.response?.data?.error || t('detail.inviteFailed') }))
      console.error('Failed to invite member:', err)
    } finally {
      setInviting(false)
    }
  }

  return (
    <>
      <DestinationHeading name="group" />

      <section className="group-section">
        <div className="section-header">
          <h2>{t('detail.membersTitle')}</h2>
          {/* Shown from the capability, not from a role. On a personal trip
              every member may invite, exactly as today; on a hosted event a
              guest may not (spec 011 §5.1, F6). */}
          {can('member.invite') && (
            <button className="add-button" onClick={() => setShowInviteForm(!showInviteForm)}>
              {showInviteForm ? t('detail.hide') : t('detail.invite')}
            </button>
          )}
        </div>

        {trip.members.length < 2 && !showInviteForm && <p className="hint">{t('trip.groupEmpty')}</p>}

        {showInviteForm && (
          <>
            <form className="question-form" onSubmit={handleInviteMember}>
              <input
                autoFocus
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('detail.emailPlaceholder')}
                required
              />
              <button type="submit" disabled={inviting || !inviteEmail.trim()}>
                {inviting ? t('detail.sending') : t('detail.sendInvite')}
              </button>
            </form>

            {inviteToken && (
              <div className="invite-box">
                <strong>{t('detail.inviteCreated')}</strong>
                <p>{t('detail.shareLink')}</p>
                <div
                  className="invite-link"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/accept-invite/${inviteToken}`)
                    alert(t('detail.linkCopied'))
                  }}
                >
                  {`${window.location.origin}/accept-invite/${inviteToken}`}
                </div>
                <p className="small">{t('detail.clickToCopy')}</p>
                <button className="btn-sm" onClick={() => setInviteToken(null)}>
                  {t('common.done')}
                </button>
              </div>
            )}
          </>
        )}

        <ul className="member-list">
          {trip.members.map((member) => (
            <li key={member.userId || member.email} className="member-row">
              <strong>{member.email || t('common.unknown')}</strong>
              <span className="member-meta">
                {/* The word for the role on this trip, as an ORDERED KEY LIST:
                    the 18-key name first (spec 012 §6.2), then the string
                    spec 003 already ships in all three languages. Rendering
                    the server's English label here instead would read
                    "Organizer" on a Spanish screen (F33, AC 27). When O8 lands
                    and `roles.*` is written, the first key wins and nothing
                    here changes. */}
                {t([member.roleLabelKey, member.roleLabelFallbackKey, 'detail.member'].filter(Boolean) as string[])}
              </span>
              <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-muted'}`}>
                {member.status === 'invited' ? t('detail.invited') : t('detail.activeBadge')}
              </span>
              {canRemove(member) && (
                <button type="button" className="btn-danger btn-sm" onClick={() => handleRemoveMember(member)}>
                  {member.status === 'invited' ? t('detail.cancelInvite') : t('detail.remove')}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {(push.status === 'off' || push.status === 'denied' || push.status === 'on') && (
        <section className="group-section">
          <div className="section-header">
            <h2>{t('trip.group.notificationsTitle')}</h2>
          </div>
          <p className="hint">{t('trip.group.notificationsHint')}</p>
          {(push.status === 'off' || push.status === 'denied') && (
            <button
              type="button"
              disabled={push.status === 'denied'}
              title={push.status === 'denied' ? t('detail.notificationsBlocked') : ''}
              onClick={push.enable}
            >
              {t('detail.enableNotifications')}
            </button>
          )}
          {push.status === 'on' && <span className="push-on">{t('detail.notificationsOn')}</span>}
        </section>
      )}
    </>
  )
}
