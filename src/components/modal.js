import React from 'react';
import ReactModal from 'react-modal';

ReactModal.setAppElement(`#___gatsby`);

const Modal = ({ isOpen, onClose, children, ...props }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      closeTimeoutMS={300}
      style={{
        overlay: {
          zIndex: 9999,
          backgroundColor: `transparent`,
        },
      }}
      {...props}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
