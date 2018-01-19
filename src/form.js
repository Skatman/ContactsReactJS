import React, { Component } from 'react';


class Form extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitState();

    this.onSubmit = this.onSubmit.bind(this);
  }

  getInitState() {
    let model = {};
    let errors = {};
    this.props.fields.forEach((field) => {
      model[field.name] = field.val;
      if (field.validators) {
        errors[field.name] = '';
      }
    });
    return { model, errors };
  }

  onChange(fieldName, event) {
    const model = JSON.parse(JSON.stringify(this.state.model));
    model[fieldName] = event.target.value;
    this.setState({ model });
  }

  onSubmit(event) {
    event.preventDefault();

    const errors = JSON.parse(JSON.stringify(this.state.errors));
    let noErrors = true;

    this.props.fields.forEach((field) => {
      if (field.validators) {
        let error = '';
        field.validators.forEach((validator) => {
          if (!validator.func(this.state.model[field.name])) {
            error = `${error} && ${validator.error}`;
            noErrors = false;
          }
        });
        errors[field.name] = error;
      }
    })

    this.setState({ errors });

    if (noErrors) {
      this.props.onSubmit(JSON.parse(JSON.stringify(this.state.model)));
      this.setState(this.getInitState());
    }
  }

  renderInputs() {
    return this.props.fields.map((field) => {
      if (!field.disabled) {
        return (
          <Input type={field.type}
            value={this.state.model[field.name]}
            placeholder={field.name}
            onChange={this.onChange.bind(this,field.name)}
            key={field.name}
            error={this.state.errors[field.name]}
          />
        )
      }
    })
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        {this.renderInputs()}
        <input type="submit" placeholder="Submit" />
      </form>
    )
  }
}

class Input extends Component {
  render() {
    const className = this.props.error && this.props.error.length > 0 ?
      "error" : "";
    return (
      <div className="input">
        <input type={this.props.type}
          placeholder={this.props.placeholder}
          value={this.props.value}
          onChange={this.props.onChange}
          className={className} />
        <p>{this.props.error}</p>
      </div>
    )
  }
}

export default Form;
