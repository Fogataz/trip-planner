import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { Trans } from 'react-i18next'

export default function AcceptInvite() {
  const { t } = useTranslation()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tripName, setTripName] = useState<string | null>(null)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001'

  useEffect(() => {
    acceptInvite()
  }, [token])

  const acceptInvite = async () => {
    try {
      if (!token) {
        setError(t('invite.invalidLink'))
        setLoading(false)
        return
      }

      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        sessionStorage.setItem('pendingInvite', `/accept-invite/${token}`)
        navigate('/')
        return
      }

      const response = await axios.post(
        `${apiUrl}/api/groups/invitations/${token}/accept`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      console.log('Accept response:', response.data)
      setTripName(response.data.trip?.name)
      setTimeout(() => {
        navigate('/trips')
      }, 2000)
    } catch (err: any) {
      console.error('Accept error:', err)
      setError(err.response?.data?.error || t('invite.acceptFailed'))
      setLoading(false)
    }
  }

  return (
    <div className="invite-page">
      <div className="invite-card">
        {loading && !error ? (
          <>
            <h2>{t('invite.accepting')}</h2>
            <div className="emoji">⏳</div>
            <p>{t('invite.wait')}</p>
          </>
        ) : error ? (
          <>
            <h2 className="text-error">{t('invite.oops')}</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/trips')}>
              {t('invite.backToTrips')}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: 'var(--success)' }}>{t('invite.success')}</h2>
            <p>
              <Trans i18nKey="invite.added" values={{ name: tripName }} components={{ b: <strong /> }} />
            </p>
            <p className="small">
              {t('invite.redirecting')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
