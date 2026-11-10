import Expenses from '../../components/Expenses'
import DestinationHeading from '../DestinationHeading'
import { isTripLive } from '../format'
import { useTrip } from '../TripContext'

export default function Money() {
  const { trip, apiUrl, token, currentUid, socket } = useTrip()
  return (
    <>
      <DestinationHeading name="money" />
      <Expenses
        groupId={trip.groupId}
        apiUrl={apiUrl}
        token={token}
        currentUid={currentUid}
        members={trip.members}
        socket={socket}
        liveNow={isTripLive(trip.startDate, trip.endDate)}
      />
    </>
  )
}
