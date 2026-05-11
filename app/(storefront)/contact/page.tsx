'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { submitEnquiry } from '@/lib/api'
import type { CreateEnquiryBody } from '@/lib/types'

const EMPTY_FORM: CreateEnquiryBody = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

export default function ContactPage() {
  const [form, setForm] = useState<CreateEnquiryBody>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateEnquiryBody, string>>>({})

  const set = <K extends keyof CreateEnquiryBody>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateEnquiryBody, string>> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!form.subject.trim()) newErrors.subject = 'Subject is required'
    if (!form.message.trim()) newErrors.message = 'Message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const body: CreateEnquiryBody = {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        ...(form.phone?.trim() ? { phone: form.phone.trim() } : {}),
      }
      await submitEnquiry(body)
      toast.success('Message sent! We\'ll be in touch soon.')
      setSubmitted(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <section className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p className="text-xs font-semibold tracking-widest text-rose-900 uppercase mb-4">
              Contact Us
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zinc-900 leading-tight mb-4">
              Get in Touch
            </h1>
            <p className="text-zinc-500 text-lg">
              We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-sm"
          >
            {submitted ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                </div>
                <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">
                  Message Sent!
                </h2>
                <p className="text-zinc-500 mb-8">
                  We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-rose-900 border border-rose-900/30 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                      Name <span className="text-rose-900">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => { set('name', e.target.value); setErrors((prev) => ({ ...prev, name: undefined })) }}
                      placeholder="Your full name"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors ${
                        errors.name ? 'border-red-400' : 'border-zinc-200'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                      Email <span className="text-rose-900">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => { set('email', e.target.value); setErrors((prev) => ({ ...prev, email: undefined })) }}
                      placeholder="you@example.com"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors ${
                        errors.email ? 'border-red-400' : 'border-zinc-200'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Phone <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Subject <span className="text-rose-900">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => { set('subject', e.target.value); setErrors((prev) => ({ ...prev, subject: undefined })) }}
                    placeholder="How can we help you?"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors ${
                      errors.subject ? 'border-red-400' : 'border-zinc-200'
                    }`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-600">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Message <span className="text-rose-900">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => { set('message', e.target.value); setErrors((prev) => ({ ...prev, message: undefined })) }}
                    placeholder="Write your message here..."
                    rows={5}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors resize-none ${
                      errors.message ? 'border-red-400' : 'border-zinc-200'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-rose-900 hover:bg-rose-950 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="flex items-start gap-3 bg-white border border-zinc-200 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={15} className="text-rose-900" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 uppercase tracking-wide mb-1">Email</p>
                <a
                  href="mailto:yaseen@example.com"
                  className="text-sm text-zinc-500 hover:text-rose-900 transition-colors break-all"
                >
                  yaseen@example.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white border border-zinc-200 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone size={15} className="text-rose-900" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-sm text-zinc-500">+92 300 0000000</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white border border-zinc-200 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={15} className="text-rose-900" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm text-zinc-500">Pakistan</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
