import { useNavigate } from "react-router-dom"
import { UserContext } from "../context/UserContext"
import { useContext, useState } from "react"
import { cardStyles } from "../assets/dummystyle.js"
// FIX: Added missing icon imports
import { Award, TrendingUp, Zap, Edit, Trash2, Clock, Check } from "lucide-react" 

// Profile Info cards
export const ProfileInfoCard = () => {
    const navigate = useNavigate()
    const { user, clearUser } = useContext(UserContext)

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate('/')
    }

    return (
        user && (
            <div className={cardStyles.profileCard}>
                <div className={cardStyles.profileInitialsContainer}>
                    <span className={cardStyles.profileInitialsText}>
                        {user.name ? user.name.charAt(0).toUpperCase() : ""}
                    </span>
                </div>
                <div>
                    <div className={cardStyles.profileName}>
                        {user.name || ""}
                    </div>
                    <button 
                        className={cardStyles.logoutButton}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        )
    )
}

// ResumeSummaryCard Component
export const ResumeSummaryCard = ({
  title = "Untitled Resume",
  createdAt = null,
  updatedAt = null,
  onSelect,
  onDelete,
  completion = 85,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formattedCreatedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "—";

  const formattedUpdatedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "—";

  const getCompletionColor = () => {
    if (completion >= 90) return cardStyles.completionHigh;
    if (completion >= 70) return cardStyles.completionMedium;
    return cardStyles.completionLow;
  };

  const getCompletionIcon = () => {
    if (completion >= 90) return <Award size={12} />;
    if (completion >= 70) return <TrendingUp size={12} />;
    return <Zap size={12} />;
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  const generateDesign = () => {
    const colors = [
      "from-blue-50 to-blue-100",
      "from-purple-50 to-purple-100",
      "from-emerald-50 to-emerald-100",
      "from-amber-50 to-amber-100",
      "from-rose-50 to-rose-100"
    ];
    // Safety check for title
    const safeTitle = title || "";
    return colors[safeTitle.length % colors.length];
  };

  const designColor = generateDesign();

  return (
    <div
      className={cardStyles.resumeCard}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cardStyles.completionIndicator}>
        <div className={`${cardStyles.completionDot} bg-gradient-to-r ${getCompletionColor()}`}>
          <div className={cardStyles.completionDotInner} />
        </div>
        <span className={cardStyles.completionPercentageText}>{completion}%</span>
        {getCompletionIcon()}
      </div>

      <div className={`${cardStyles.previewArea} bg-gradient-to-br ${designColor}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cardStyles.emptyPreviewIcon}>
            <Edit size={28} className="text-indigo-600" />
          </div>
          <span className={cardStyles.emptyPreviewText}>{title}</span>
          <span className={cardStyles.emptyPreviewSubtext}>
            {completion === 0 ? "Start building" : `${completion}% completed`}
          </span>

          <div className="mt-4 flex gap-2">
            {['Profile', 'Work', 'Skills', 'Edu'].map((section, i) => (
              <div
                key={i}
                className={`px-2 py-1 text-xs rounded-md ${i < Math.floor(completion / 25)
                  ? 'bg-white/90 text-indigo-600 font-medium'
                  : 'bg-white/50 text-gray-500'
                  }`}
              >
                {section}
              </div>
            ))}
          </div>
        </div>

        {isHovered && (
          <div className={cardStyles.actionOverlay}>
            <div className={cardStyles.actionButtonsContainer}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelect) onSelect();
                }}
                className={cardStyles.editButton}
              >
                <Edit size={18} className={cardStyles.buttonIcon} />
              </button>
              <button
                onClick={handleDeleteClick}
                className={cardStyles.deleteButton}
              >
                <Trash2 size={18} className={cardStyles.buttonIcon} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={cardStyles.infoArea}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h5 className={cardStyles.title}>{title}</h5>
            <div className={cardStyles.dateInfo}>
              <Clock size={12} />
              <span>Created At: {formattedCreatedDate}</span>
              <span className="ml-2">Updated At: {formattedUpdatedDate}</span>
            </div>
          </div>
        </div>

        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getCompletionColor()} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs font-medium text-gray-500">
            {completion < 50 ? "Getting Started" : completion < 80 ? "Almost There" : "Ready to Go!"}
          </span>
          <span className="text-xs font-bold text-gray-700">{completion}% Complete</span>
        </div>
      </div>
    </div>
  );
};

// templates cards

export const TemplateCard = ({ thumbnailImg, isSelected, onSelect }) => {
  return (

    <div className={` group h-auto md:h-[300px] lg:h-[320px] flex flex-col bg-white border-2 overflow-hidden
      cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-lg rounded-3xl
    ${isSelected ? 'border-violet-500 shadow-1g shadow-violet-500/20 bg-violet-50' :
      'border-gray-200 hover:border-violet-300'   }`} onClick={onSelect}>

        {thumbnailImg ? (
          <div className=" relative w-full h-full overflow-hidden">
            <img src={thumbnailImg || '/placeholder.svg'} alt="Template Review" className=" w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className=" absolute insert-0 bg-gradient-to-t from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

              {isSelected && (
              <div className=" absolute inset-0 bg-violet-500/10 flex item-center justify-center">
                <div className=" w-16 h-16 bg-white backdrop-blur-sm rounded-full flex item-center justify-center shadow-lg animate-pulse">
                  <Check size={24} className=" text-violet-600" />
                </div>
              </div>
              )}
            {/* Hover Overlay */}
            <div className=" absolute inset-0 bg-gradient-to-t from-violet-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            </div> 
          </div>
          ) : (
            <div className=" w-full h-[200px] flex items-center felx-col justify-center bg-gradient-to-br frpm-violet-50 via-violet-600 to-fuchsia-50">
              <div className=" w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchisia-500 flex item-center justify-center mb-3">
                <Edit size={20} className=" text-white" />
              </div>
              <span className="  font-bold text-gray-700">
                No Preview Available
              </span>
            </div>
          )}
    </div>
  )
}
