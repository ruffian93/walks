import React, { Component } from 'react';
import { Alert } from 'reactstrap';

class ErrorField extends Component {
  render() {
    const {
      input,
      type,
      placeholder,
      required,
      className,
      label,
      meta: { error, touched }
    } = this.props;
    const errorMessage = touched &&
      error && <span>{error}</span>;
    
    return (
      <div>
        <label htmlFor={input.id} className="sr-only">{label}</label>
        <input placeholder={placeholder} required={required} className={className} {...input} type={type} />
        {errorMessage}
      </div>
    )
  }
}

export default ErrorField
