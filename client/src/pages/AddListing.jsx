import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAccommodation } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AccommodationForm from '../components/Forms/AccommodationForm.jsx';

export default function AddListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const created = await createAccommodation({
        ...formData,
        created_by_id:   user?.id   || null,
        created_by_name: user?.user_metadata?.full_name || user?.email || null,
      });
      navigate(`/listings/${created.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate('/listings')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back to Listings
        </button>
        <h1 className="page-title">Add New Listing</h1>
        <p className="page-subtitle">Fill in the details to add a new accommodation to the database</p>
      </div>

      <AccommodationForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
