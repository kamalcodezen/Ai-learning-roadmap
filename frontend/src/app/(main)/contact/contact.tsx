import React from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Have a question, feedback, or want to collaborate? We’d love to hear from you. Fill out the form or reach out through our contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information & Quick Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="dashboard-card flex items-start space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Email Us</h3>
                <p className="text-sm text-slate-500 mt-1">Our team usually responds within 24 hours.</p>
                <a href="mailto:support@example.com" className="text-sm font-medium text-blue-600 hover:underline mt-2 inline-block">
                  support@example.com
                </a>
              </div>
            </div>

            <div className="dashboard-card flex items-start space-x-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Call Us</h3>
                <p className="text-sm text-slate-500 mt-1">Mon - Fri from 9am to 6pm IST.</p>
                <a href="tel:+1234567890" className="text-sm font-medium text-green-600 hover:underline mt-2 inline-block">
                  +1 (234) 567-890
                </a>
              </div>
            </div>

            <div className="dashboard-card flex items-start space-x-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Visit Us</h3>
                <p className="text-sm text-slate-500 mt-1">Come say hello at our main office headquarters.</p>
                <p className="text-sm font-medium text-slate-700 mt-2">
                  123 Innovation Way, Tech Suite 400<br />
                  San Francisco, CA 94107
                </p>
              </div>
            </div>
          </div>

          {/* Main Contact Form */}
          <div className="lg:col-span-2">
            <div className="dashboard-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Send us a Message</h2>
                  <p className="text-sm text-slate-500">Fill in the fields below to get started.</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      name="first-name"
                      placeholder="John"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      name="last-name"
                      placeholder="Doe"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="How can we help?"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}