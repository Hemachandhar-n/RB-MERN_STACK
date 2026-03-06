import React, { useRef, useState } from 'react'
import { inputStyles, photoSelectorStyles, titleInputStyles } from '../assets/dummystyle.js'
import { Eye, EyeOff, Camera, Edit, Trash2, Check } from 'lucide-react'

export const Inputs = ({
  value,
  onChange,
  label,
  placeholder,
  type = 'text'
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const styles = inputStyles
  const inputContainerClass =
    typeof styles.inputContainer === 'function'
      ? styles.inputContainer(isFocused)
      : styles.inputContainer

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={inputContainerClass}>
        <input
          type={
            type === 'password'
              ? showPassword ? 'text' : 'password'
              : type
          }
          placeholder={placeholder}
          className={styles.inputField}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className={styles.toggleButton}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  )
}

export const Input = Inputs;


export const ProfilePhotoSelector = ({ setImage, preview, setPreview }) => {
  const inputRef = useRef(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(preview || null);
  const [hovered, setHovered] = useState(false);
  const styles = photoSelectorStyles;
  const previewUrl = preview ?? localPreviewUrl;
  const placeholderClass =
    typeof styles.placeholder === 'function'
      ? styles.placeholder(hovered)
      : styles.placeholder;
  const previewImageContainerClass =
    typeof styles.previewImageContainer === 'function'
      ? styles.previewImageContainer(hovered)
      : styles.previewImageContainer;

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setLocalPreviewUrl(url);
      setPreview?.(url);
    }
  };

  const handleRemove = () => {
    setImage(null);
    setLocalPreviewUrl(null);
    setPreview?.(null);
  };

  const chooseFile = () => inputRef.current.click();

  return (
    <div className={styles.container}>
      <input type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} className={styles.hiddenInput} />
      {!previewUrl ? (
        <div
          className={placeholderClass}
          onClick={chooseFile}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button type="button" className={styles.cameraButton}>
            <Camera size={20} />
          </button>
        </div>
      ) : (
        <div
          className={styles.previewWrapper}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className={previewImageContainerClass} onClick={chooseFile}>
            <img src={previewUrl} alt="profile" className={styles.previewImage} />
          </div>
          <div className={styles.overlay}>
            <button
              type="button"
              className={styles.actionButton('white', 'gray-100', 'gray-700')}
              onClick={chooseFile}
            >
              <Edit size={16} />
            </button>
            <button
              type="button"
              className={styles.actionButton('red-100', 'red-200', 'red-600')}
              onClick={handleRemove}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
 
export const TitleInput = ({ title, setTitle }) => {
  const [editing, setEditing] = useState(false);
  const [focused, setFocused] = useState(false);
  const styles = titleInputStyles;
  const inputFieldClass =
    typeof styles.inputField === 'function'
      ? styles.inputField(focused)
      : styles.inputField;

  return (
    <div className={styles.container}>
      {editing ? (
        <>
          <input
            type="text"
            placeholder="Resume title"
            className={inputFieldClass}
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
          />
          <button className={styles.confirmButton} onClick={() => setEditing(false)}>
            <Check className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <h2 className={styles.titleText}>{title}</h2>
          <button className={styles.editButton} onClick={() => setEditing(true)}>
            <Edit className={styles.editIcon} />
          </button>
        </>
      )}
    </div>
  );
};
