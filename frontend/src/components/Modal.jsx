import React from 'react'
import { X } from "lucide-react"
import { modalStyles } from "../assets/dummystyle.js"

// Added 'title' to the props below
const Modal = ({ children, isOpen, onClose, hideHeader, showActionBtn, actionBtnIcon = null, actionBtnText, title, 
    onActionClick = () => {},

 }) => {
    if (!isOpen) return null

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div 
            className={modalStyles.overlay} 
            onClick={handleOverlayClick}
        >
            <div className={modalStyles.container}>
                {/* Close Button */}
                <button
                    className={modalStyles.closeButton}
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                {/* Header (Conditional) */}
                {!hideHeader && (
                    <div className={modalStyles.header}>
                        <h3 className={modalStyles.title}>{title}</h3>
                        {/* Optional action button can be added here */}
                        {showActionBtn && (
                            <button 
                                className={modalStyles.actionButton} onClick={onActionClick}>
                                    {actionBtnIcon}
                                    {actionBtnText}
                                </button>
                        )}
                    </div>
                )}

                <button type='button' className={modalStyles.closeButton} onClick={onClose}>
                        <X size={28} />
                </button>

                {/* Content */}
                <div className={modalStyles.body}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal