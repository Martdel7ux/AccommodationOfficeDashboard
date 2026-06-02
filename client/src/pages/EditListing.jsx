import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAccommodation, updateAccommodation } from '../utils/api.js';
import AccommodationForm from '../components/Forms/AccommodationForm.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    getAccommodation(id)
      .then(setData)
      .catch(() => setFetchError('Could not load listing.'));
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await updateAccommodation(id, formData);
      navigate(`/listings/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-red-500 text-sm">{fetchError}</p>
        <button onClick={() => navigate('/listings')} className="btn-secondary btn-sm">
          Back to Listings
        </button>
      </div>
    );
  }

  if (!data) return <LoadingSpinner text="Loading listing…" />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/listings/${id}`)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back to Listing
        </button>
        <h1 className="page-title">Edit Listing</h1>
        <p className="page-subtitle">{data.address}</p>
      </div>

      <AccommodationForm initialData={data} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
