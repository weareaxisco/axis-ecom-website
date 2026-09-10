import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

const initialForm = {
  title: 'Mrs.',
  firstName: '',
  lastName: '',
  email: '',
  country: 'Morocco (+212)',
  phone: '',
  password: '',
}

const inputClass = 'w-full rounded-none border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200 transition-all outline-none focus:border-amber-500/70 focus:bg-neutral-900'
const labelClass = 'mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-neutral-400'

function ErrorSlot({ message }) {
  return <div className="min-h-[18px] pt-1 text-[11px] font-mono text-rose-400">{message || ''}</div>
}

export default function Register() {
  const { t } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('form')
  const [submitError, setSubmitError] = useState('')

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSubmitError('')
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.firstName.trim()) nextErrors.firstName = t('firstNameRequired')
    if (!form.lastName.trim()) nextErrors.lastName = t('lastNameRequired')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = t('validEmail')
    if (!/^\+212\s?[67]\d{2}[-\s]?\d{6}$/.test(form.phone.trim())) nextErrors.phone = t('phoneFormat')
    if (form.password.length < 8) nextErrors.password = t('passwordLength')
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitError('')
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          title: form.title,
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          phone: form.phone.trim(),
          country: form.country,
        },
      },
    })
    if (error) {
      setSubmitError(error.message)
      return
    }
    setStatus('verification')
  }

  if (status === 'verification') {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-12">
        <section className="mx-auto max-w-xl border border-neutral-800 bg-neutral-950/70 p-8 text-center shadow-2xl md:p-14">
          <Mail className="mx-auto text-amber-400" size={38} strokeWidth={1.1} />
          <p className="mt-8 text-[11px] uppercase tracking-[0.25em] text-amber-400">{t('welcomeMaison')}</p>
          <h1 className="mt-4 font-serif text-3xl uppercase tracking-widest">{t('verifyEmail')}</h1>
          <p className="mt-6 text-sm leading-7 text-neutral-300">{t('emailSentTo')} <strong className="text-white">{form.email}</strong></p>
          <p className="mt-2 text-xs leading-6 text-neutral-500">{t('verificationInstructions')}</p>
          <button type="button" onClick={() => { window.location.href = 'mailto:' }} className="mt-8 inline-flex items-center justify-center gap-2 border border-amber-500 bg-amber-500 px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-black transition-colors hover:bg-transparent hover:text-amber-400">
            {t('openEmailApp')}
          </button>
          <button type="button" onClick={() => setStatus('form')} className="mt-6 block w-full text-[11px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-amber-400">
            {t('changeEmail')}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-12">
      <div className="mx-auto max-w-3xl">
        <header className="text-center"><p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-gold)]">{t('maison')}</p><h1 className="mt-3 font-serif text-3xl uppercase tracking-widest md:text-5xl">{t('createAccount')}</h1></header>
        <form className="mt-12 space-y-7" onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend className={labelClass}>{t('title')}</legend>
            <div className="flex gap-3">
              {['Mrs.', 'Mr.'].map((option) => <label key={option} className={`flex cursor-pointer items-center gap-2 border px-4 py-3 text-xs uppercase tracking-widest transition-colors ${form.title === option ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-neutral-800 text-neutral-400'}`}><input type="radio" name="title" value={option} checked={form.title === option} onChange={updateField('title')} className="sr-only" /><span className={`h-3 w-3 rounded-full border ${form.title === option ? 'border-amber-400 bg-amber-400' : 'border-neutral-600'}`} />{option}</label>)}
            </div>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            {['firstName', 'lastName'].map((field) => <label key={field}><span className={labelClass}>{field === 'firstName' ? t('firstName') : t('lastName')}</span><input required value={form[field]} onChange={updateField(field)} className={inputClass} /><ErrorSlot message={errors[field]} /></label>)}
            <label><span className={labelClass}>{t('email')}</span><input type="email" value={form.email} onChange={updateField('email')} className={inputClass} /><ErrorSlot message={errors.email} /></label>
            <label><span className={labelClass}>{t('countryRegionLabel')}</span><select value={form.country} onChange={updateField('country')} className={inputClass}><option>Morocco (+212)</option></select><ErrorSlot /></label>
            <label><span className={labelClass}>{t('phone')}</span><input type="tel" value={form.phone} onChange={updateField('phone')} placeholder="+212 6XX-XXXXXX" className={inputClass} /><small className="block text-xs text-neutral-500">{t('phoneFormatHint')}</small><ErrorSlot message={errors.phone} /></label>
            <label><span className={labelClass}>{t('password')}</span><div className="relative"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField('password')} className={`${inputClass} pr-12`} /><button type="button" aria-label={t('togglePassword')} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-neutral-400 hover:text-amber-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><ErrorSlot message={errors.password} /></label>
          </div>
          <label className="flex gap-3 text-xs leading-relaxed text-neutral-400"><input type="checkbox" required className="mt-1 accent-amber-500" />{t('consentCndp')}</label>
          {submitError && <p className="border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">{submitError}</p>}
          <button type="submit" className="w-full border border-amber-500 bg-amber-500 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-transparent hover:text-amber-400">{t('createAccountAction')}</button>
        </form>
        <p className="mt-8 text-center text-xs text-neutral-500">{t('alreadyHaveAccount')} <Link to="/login" className="text-amber-400">{t('login')}</Link></p>
        <div className="mt-16 border-t border-[var(--border-subtle)] py-8 text-center"><h2 className="font-serif text-lg uppercase tracking-widest">{t('newsletterTitle')}</h2><div className="mx-auto mt-5 flex max-w-md border-b border-[var(--border-subtle)]"><input type="email" placeholder={t('emailAddressPlaceholder')} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><button type="button" className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">{t('signUp')}</button></div></div>
      </div>
    </main>
  )
}
