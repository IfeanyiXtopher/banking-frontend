import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Pencil, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import PageShell from '@/components/layout/PageShell'
import { SettingsToggle } from '@/components/settings/SettingsControls'
import { cn } from '@/utils/cn'
import { loadNotificationPrefs, saveNotificationPrefs } from '@/lib/notificationPrefsStorage'
import { ID_DOCUMENT_TYPES } from '@/lib/personalProfileOptions'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

interface ProfileResponse {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  kyc_status: string
  is_mfa_enabled: boolean
  profile_picture: string | null
  address?: string
  date_of_birth?: string | null
  nationality?: string
  requires_profile_setup?: boolean
  id_document_type?: string
  id_document_number?: string
}

function splitAddress(addr: string | undefined): { street: string; city: string; zip: string; country: string } {
  if (!addr?.trim()) return { street: '', city: '', zip: '', country: '' }
  const parts = addr
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    zip: parts[2] || '',
    country: parts[3] || '',
  }
}

function joinAddress(a: { street: string; city: string; zip: string; country: string }): string {
  return [a.street, a.city, a.zip, a.country].filter(Boolean).join('\n')
}

function resetFormFromProfile(
  profile: ProfileResponse,
  setters: {
    setFullName: (v: string) => void
    setPhone: (v: string) => void
    setEmail: (v: string) => void
    setDob: (v: string) => void
    setNationality: (v: string) => void
    setAddr: (v: { street: string; city: string; zip: string; country: string }) => void
    setIdDocumentType: (v: string) => void
    setIdDocumentNumber: (v: string) => void
    setProfilePictureFile: (v: File | null) => void
    setEmailPref: (v: boolean) => void
    setSmsPref: (v: boolean) => void
    setPushPref: (v: boolean) => void
  },
) {
  setters.setFullName(profile.full_name || '')
  setters.setPhone(profile.phone || '')
  setters.setEmail(profile.email || '')
  setters.setDob(profile.date_of_birth ? String(profile.date_of_birth).slice(0, 10) : '')
  setters.setNationality(profile.nationality || '')
  setters.setAddr(splitAddress(profile.address))
  setters.setIdDocumentType(profile.id_document_type || '')
  setters.setIdDocumentNumber(profile.id_document_number || '')
  setters.setProfilePictureFile(null)
  const np = loadNotificationPrefs()
  setters.setEmailPref(np.email)
  setters.setSmsPref(np.sms)
  setters.setPushPref(np.push)
}

export default function SettingsPersonalPage() {
  const { refreshProfile } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)

  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  })
  const profile = profileRes?.data as ProfileResponse | undefined

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [nationality, setNationality] = useState('')
  const [addr, setAddr] = useState({ street: '', city: '', zip: '', country: '' })
  const [idDocumentType, setIdDocumentType] = useState('')
  const [idDocumentNumber, setIdDocumentNumber] = useState('')
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [photoObjectUrl, setPhotoObjectUrl] = useState<string | null>(null)
  const [emailPref, setEmailPref] = useState(true)
  const [smsPref, setSmsPref] = useState(false)
  const [pushPref, setPushPref] = useState(true)

  useEffect(() => {
    if (!profilePictureFile) {
      setPhotoObjectUrl(null)
      return
    }
    const u = URL.createObjectURL(profilePictureFile)
    setPhotoObjectUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [profilePictureFile])

  useEffect(() => {
    if (!profile) return
    resetFormFromProfile(profile, {
      setFullName,
      setPhone,
      setEmail,
      setDob,
      setNationality,
      setAddr,
      setIdDocumentType,
      setIdDocumentNumber,
      setProfilePictureFile,
      setEmailPref,
      setSmsPref,
      setPushPref,
    })
  }, [profile])

  const requestMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      fd.append('proposed_full_name', fullName.trim())
      fd.append('proposed_phone', phone.trim())
      fd.append('proposed_address', joinAddress(addr))
      if (dob) fd.append('proposed_date_of_birth', dob)
      fd.append('proposed_nationality', nationality.trim())
      if (email.trim() && email.trim() !== profile?.email) {
        fd.append('proposed_email', email.trim())
      }
      fd.append('proposed_id_document_type', idDocumentType)
      fd.append('proposed_id_document_number', idDocumentNumber.trim())
      if (profilePictureFile) fd.append('proposed_profile_picture', profilePictureFile)
      return authApi.submitProfileUpdateRequest(fd)
    },
    onSuccess: (res) => {
      toast.success(res.data?.detail || 'Your change request has been submitted for review.')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      refreshProfile()
      setProfilePictureFile(null)
      setEditing(false)
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Could not submit request.')
    },
  })

  if (isLoading || !profile) {
    return (
      <PageShell badge="Settings" title="Personal information" description="Loading your profile…" backTo="/settings">
        <div className="animate-pulse space-y-4">
          <div className="h-36 rounded-2xl bg-gray-100" />
          <div className="h-48 rounded-2xl bg-gray-100" />
        </div>
      </PageShell>
    )
  }

  if (profile.requires_profile_setup === true) {
    return <Navigate to="/complete-profile" replace />
  }

  const verified = profile.kyc_status === 'APPROVED'
  const displayName = fullName || profile.full_name || '?'
  const initials = displayName
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const avatarSrc = photoObjectUrl || mediaUrl(profile.profile_picture)

  const cancelEdit = () => {
    resetFormFromProfile(profile, {
      setFullName,
      setPhone,
      setEmail,
      setDob,
      setNationality,
      setAddr,
      setIdDocumentType,
      setIdDocumentNumber,
      setProfilePictureFile,
      setEmailPref,
      setSmsPref,
      setPushPref,
    })
    setEditing(false)
  }

  return (
    <PageShell
      badge="Settings"
      title="Personal information"
      backTo="/settings"
      description={
        <div className="space-y-2">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Link to="/settings" className="transition-colors hover:text-primary-dark">
              All settings
            </Link>
            <ChevronRight size={12} className="text-gray-300" aria-hidden />
            <span className="text-gray-700">Personal</span>
          </nav>
          <p className="text-sm leading-relaxed text-gray-600">
            Keep your details current. Some changes are reviewed before they appear on your account.
          </p>
        </div>
      }
      headerAside={
        <button
          type="button"
          onClick={() => (editing ? cancelEdit() : setEditing(true))}
          className="btn-outline inline-flex items-center gap-2 py-2.5 text-sm"
        >
          <Pencil size={14} />
          {editing ? 'Cancel' : 'Request changes'}
        </button>
      }
      contentClassName="!space-y-5"
    >
      <div className="flex gap-3 rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/80 to-white px-4 py-3.5 shadow-sm sm:gap-4 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800 sm:h-10 sm:w-10 sm:rounded-xl">
          <ShieldAlert size={18} strokeWidth={1.75} className="sm:hidden" aria-hidden />
          <ShieldAlert size={20} strokeWidth={1.75} className="hidden sm:block" aria-hidden />
        </div>
        <div className="min-w-0 text-sm leading-snug text-gray-700">
          <p className="font-semibold text-gray-900">Profile changes require approval</p>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
            Updates to your name, contact details, address, ID, or photo are reviewed for your security. We will email you
            when a request is approved.
          </p>
        </div>
      </div>

      <section className="settings-panel">
        <div className="px-5 py-4 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                className="h-24 w-20 shrink-0 rounded-xl border border-gray-200/90 object-cover shadow-sm sm:h-28 sm:w-24 sm:rounded-2xl"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-dark text-base font-bold text-white shadow-md sm:h-20 sm:w-20 sm:rounded-2xl sm:text-lg">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">{profile.full_name}</p>
                {verified && (
                  <span className="rounded-full bg-primary-dark/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-dark">
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-600">{profile.phone || '—'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-panel">
        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:px-6">
          <h2 className="text-sm font-semibold tracking-tight text-gray-900">Identity on file</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-600 sm:text-[13px]">
            Verifiable ID and photo. For a different account product, contact support.
          </p>
        </div>
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="max-w-3xl space-y-3.5">
            <Field label="Verifiable ID type">
              <select
                className="input-field py-2.5 text-sm"
                value={idDocumentType}
                onChange={(e) => setIdDocumentType(e.target.value)}
                disabled={!editing}
              >
                <option value="">Select…</option>
                {ID_DOCUMENT_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ID number">
              <input
                className="input-field py-2.5 text-sm"
                value={idDocumentNumber}
                onChange={(e) => setIdDocumentNumber(e.target.value)}
                placeholder="Document number as shown on your ID"
                disabled={!editing}
              />
            </Field>
            <Field label="Passport-style photo (optional)">
              <input
                type="file"
                accept="image/*"
                className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-800 hover:file:bg-gray-200/80"
                disabled={!editing}
                onChange={(e) => setProfilePictureFile(e.target.files?.[0] ?? null)}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="settings-panel">
        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:px-6">
          <h2 className="text-sm font-semibold tracking-tight text-gray-900">Contact & address</h2>
          <p className="mt-0.5 text-xs text-gray-600 sm:text-[13px]">How we reach you and where you receive mail.</p>
        </div>
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-3.5 lg:grid-cols-2 lg:items-start">
            <Field label="Name">
              <input className="input-field py-2.5 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!editing} />
            </Field>
            <Field label="Street">
              <input
                className="input-field py-2.5 text-sm"
                value={addr.street}
                onChange={(e) => setAddr((a) => ({ ...a, street: e.target.value }))}
                placeholder="Street, building, unit"
                disabled={!editing}
              />
            </Field>
            <Field label="Email">
              <input className="input-field py-2.5 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} />
            </Field>
            <Field label="City">
              <input
                className="input-field py-2.5 text-sm"
                value={addr.city}
                onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
                disabled={!editing}
              />
            </Field>
            <Field label="Phone">
              <input className="input-field py-2.5 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Zip code">
                <input
                  className="input-field py-2.5 text-sm"
                  value={addr.zip}
                  onChange={(e) => setAddr((a) => ({ ...a, zip: e.target.value }))}
                  disabled={!editing}
                />
              </Field>
              <Field label="Country">
                <input
                  className="input-field py-2.5 text-sm"
                  value={addr.country}
                  onChange={(e) => setAddr((a) => ({ ...a, country: e.target.value }))}
                  disabled={!editing}
                />
              </Field>
            </div>
            <Field label="Date of birth">
              <input type="date" className="input-field py-2.5 text-sm" value={dob} onChange={(e) => setDob(e.target.value)} disabled={!editing} />
            </Field>
            <Field label="Nationality">
              <input
                className="input-field py-2.5 text-sm"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Country"
                disabled={!editing}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="settings-panel">
        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:px-6">
          <h2 className="text-sm font-semibold tracking-tight text-gray-900">Security & notifications</h2>
          <p className="mt-0.5 text-xs text-gray-600 sm:text-[13px]">
            Sign-in snapshot; notification choices save when you submit a change request.
          </p>
        </div>
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="space-y-5">
            <div className="space-y-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Security</p>
              <Field label="Password">
                <input className="input-field cursor-not-allowed bg-gray-50 py-2.5 text-sm" type="password" value="••••••••" readOnly disabled />
              </Field>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-factor authentication</p>
                  <p className="text-xs text-gray-500">{profile.is_mfa_enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    profile.is_mfa_enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600',
                  )}
                >
                  {profile.is_mfa_enabled ? 'On' : 'Off'}
                </span>
              </div>
              <Link to="/settings/security" className="inline-flex text-sm font-semibold text-primary-dark hover:underline">
                Open security settings →
              </Link>
            </div>
            <div className="border-t border-gray-100 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Communication</p>
              <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/30">
                {[
                  { label: 'Email', state: emailPref, set: setEmailPref },
                  { label: 'SMS', state: smsPref, set: setSmsPref },
                  { label: 'Push notifications', state: pushPref, set: setPushPref },
                ].map(({ label, state, set }) => (
                  <li key={label} className="flex items-center justify-between gap-3 px-3 py-2.5 first:rounded-t-xl last:rounded-b-xl">
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                    <SettingsToggle checked={state} onChange={() => set(!state)} disabled={!editing} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {editing && (
        <button
          type="button"
          disabled={requestMutation.isPending}
          onClick={() => {
            saveNotificationPrefs({ email: emailPref, sms: smsPref, push: pushPref })
            if (!fullName.trim()) {
              toast.error('Name is required.')
              return
            }
            requestMutation.mutate()
          }}
          className="btn-primary px-8 py-3 text-sm"
        >
          {requestMutation.isPending ? 'Submitting…' : 'Submit change request'}
        </button>
      )}
    </PageShell>
  )
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="settings-field-label">{label}</label>
      {children}
    </div>
  )
}
