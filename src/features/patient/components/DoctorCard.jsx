import { Star, MapPin, DollarSign } from 'lucide-react'; // محتاج تعمل npm install lucide-react لو مش عندك

const DoctorCard = ({ doctor, onBookClick }) => {
  const { name, specialization, rating, reviewsCount, clinic, gender, profileImage } = doctor;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5">
      {/* صورة الدكتور */}
      <div className="relative">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
          {profileImage ? (
            <img src={profileImage} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
              {name[0]}
            </div>
          )}
        </div>
      </div>

      {/* تفاصيل الدكتور */}
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-800">د. {name}</h3>
            <p className="text-blue-600 font-medium text-sm">{specialization}</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-yellow-700">{rating || 'جديد'}</span>
            <span className="text-xs text-gray-400">({reviewsCount})</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{clinic.city}, {clinic.governorate}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>كشف: <span className="font-bold text-gray-800">{clinic.consultationFee} ج.م</span></span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button 
            onClick={() => onBookClick(doctor.id)}
            className="flex-grow bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            احجز موعد
          </button>
          <button className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            عرض الملف
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;