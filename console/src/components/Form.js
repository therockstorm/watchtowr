import React from 'react';
import './Form.css';

const Form = ({ children }) => (
  <div className="form">
    <form>
      {{ ...children }}
    </form>
  </div>
);

Form.propTypes = {
  children: React.PropTypes.object.isRequired,
};

export default Form;
