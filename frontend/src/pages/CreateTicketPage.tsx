import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { TicketForm, type TicketFormValues } from '../components/TicketForm';
import { createTicket } from '../hooks/useTickets';

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = async (values: TicketFormValues) => {
    const created = await createTicket(values);
    navigate(`/tickets/${created._id}`);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Tickets
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Submit a New Ticket
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Describe your request or issue in detail so our support team can
                help promptly.
              </p>
            </div>
          </div>

          <TicketForm
            submitLabel="Create Ticket"
            onSubmit={handleCreate}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      </div>
    </Layout>
  );
};
