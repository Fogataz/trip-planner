import Expenses from '../../components/Expenses'
import DestinationHeading from '../DestinationHeading'
import { useTrip } from '../TripContext'

export default function Money() {
  const { trip, apiUrl, token, currentUid, phase } = useTrip()
  return (
    <>
      <DestinationHeading name="money" />
      <Expenses
        groupId={trip.groupId}
        apiUrl={apiUrl}
        token={token}
        currentUid={currentUid}
        members={trip.members}
        liveNow={phase === 'live'}
      />
    </>
  )
}
