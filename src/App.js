import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: []
    }

    this.addContact = this.addContact.bind(this);
    this.deleteContact = this.deleteContact.bind(this);
    this.editContact = this.editContact.bind(this);
  }

  componentDidMount() {
    this.fetchContacts();
  }

  fetchContacts() {
    const self = this;
    axios.get('/contacts.json')
      .then(function (response) {
        console.log(self.processRawContacts(response.data));
        self.setState({
          contacts: self.processRawContacts(response.data)
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  processRawContacts(rawContacts) {
    return rawContacts.map((contact, index) => {
      const name = `${contact.name.first} ${contact.name.last}`;
      const address = `${contact.address.street} ${contact.address.city} ${contact.address.state} ${contact.address.zip}`;
      const { phone, email, picture } = contact;
      return {
        id: index,
        name: name,
        address: address,
        phone: phone,
        email: email,
        picture: picture
      }
    })
  }

  addContact(contact) {
    let { contacts } = this.state;
    let id = 0;
    contacts.forEach((contact) => {
      if (contact.id > id) {
        id = contact.id;
      }
    })
    contact.id = ++id;
    contacts.push(contact);
    this.setState({ contacts });
  }

  deleteContact(id) {
    for (let i = 0; i < this.state.contacts.length; i++) {
      if (this.state.contacts[i].id === id) {
        const contacts = this.state.contacts.slice();
        contacts.splice(i,1);
        this.setState({ contacts });
        return true;
      }
    }
    return false;
  }

  editContact(contact) {
    alert('edit is clicked!');
    for (let i = 0; i < this.state.contacts.length; i++) {
      if (this.state.contacts[i].id === contact.id) {
        const contacts = this.state.contacts.slice();
        Object.getOwnPropertyNames(contacts[i]).forEach((property) => {
          contacts[i][property] = contact[property];
        });
        this.setState({ contacts });
        return true;
      }
    }
  }

  render() {
    return (
      <div className="App">
        <AddContact onSubmit={this.addContact}/>
        <ContactsList contacts={this.state.contacts}
          onDelete={this.deleteContact}
          onEdit={this.editContact}/>
      </div>
    );
  }
}

class ContactsList extends Component {
  render() {
    return (
      this.props.contacts.map((contact) => {
        return <Contact contact={contact} key={contact.id}
          onDelete={this.props.onDelete}
          onEdit={this.props.onEdit}/>
      })
    )
  }
}

class Contact extends Component {
  constructor(props) {
      super(props);

      this.state = {
        editMode: false
      }

      this.editModeSwitch = this.editModeSwitch.bind(this);
  }

  editModeSwitch() {
    const editMode = this.state.editMode ? false : true;
    this.setState({ editMode });
  }

  render() {
    const { contact } = this.props;
    if (!this.state.editMode) {
      return (
        <div className="contact-row">
          <div className="contact-cell">
            <div className="contact-image">
              <img src={contact.picture} />
            </div>
          </div>
          <div className="contact-cell">
            {contact.name}
          </div>
          <div className="contact-cell">
            {contact.phone}
          </div>
          <div className="contact-cell">
            {contact.email}
          </div>
          <div className="contact-cell">
            {contact.address}
          </div>
          <div className="contact-cell">
            <button onClick={this.editModeSwitch}>Edit</button>
            <button onClick={this.props.onDelete.bind(this,contact.id)}>Delete</button>
          </div>
        </div>
      )
    } else {
      return (
          <AddContact contact={contact}
            onCancel={this.editModeSwitch}
            onSubmit={this.props.onEdit}/>
      )
    }
  }
}

class AddContact extends Component {
  constructor(props) {
    super(props);

    let contact = {};
    if (this.props.contact !== undefined) {
      Object.getOwnPropertyNames(this.props.contact).forEach((property) => {
        contact[property] = this.props.contact[property];
      });
    } else {
      contact = this.contactStateDefaults();
    }

    this.state = {
      contact: contact,
      message: {
        type: undefined,
        text: ''
      },
      fieldsErrors: {
        name: '',
        email: ''
      }
    }

    this.inputChange = this.inputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  inputChange(propName, event) {
    const { contact } = this.state;
    if (contact.hasOwnProperty(propName)) {
      contact[propName] = event.target.value;
      this.setState({contact});
    }
  }

  onSubmit(event) {
    event.preventDefault();

    alert('add contact on submit is called!');
    if (this.validateForm() === true) {
      alert('validation passed');
      let contact = {};
      Object.getOwnPropertyNames(this.state.contact).forEach((property) => {
        contact[property] = this.state.contact[property];
      });
      console.log(this.props);
      console.log(contact);
      this.props.onSubmit(contact);
      this.setState({
        contact: this.contactStateDefaults()
      });
    }
  }

  validateEmail(email) {
    var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    return re.test(email);
  }

  validateForm() {
    const { contact } = this.state;
    let messages = [];
    let message = {};
    let fieldsErrors = {
      name: '',
      email: ''
    };

    if (contact.name.length === 0) {
      messages.push('Name should not be empty');
      fieldsErrors.name = 'Name should not be empty';
    }
    if (contact.email.length > 0 && !this.validateEmail(contact.email)) {
      messages.push('Email should be valid');
      fieldsErrors.email = 'Not valid email';
    }
    if (messages.length === 0) {
      message = {
        type: 'success',
        text: 'Contact has been saved'
      }
    }
    this.setState({ message , fieldsErrors });
    if (message.type === 'success') {
      return true;
    } else {
      return false;
    }
  }

  contactStateDefaults() {
    return {
      id: undefined,
      name: '',
      phone: '',
      email: '',
      address: '',
      picture: 'http://placebear.com/187/187'
    }
  }

  render() {
    let { contact } = this.state;
    return (
      <div className="add-contact">
        <form onSubmit={this.onSubmit}>
          <Input type="text" placeholder="Name"
            value={contact.name} onChange={this.inputChange.bind(this,"name")}
            error={this.state.fieldsErrors.name}/>
          <Input type="text" placeholder="Phone"
            value={contact.phone} onChange={this.inputChange.bind(this,"phone")}/>
          <Input type="text" placeholder="Email"
            value={contact.email} onChange={this.inputChange.bind(this,"email")}
            error={this.state.fieldsErrors.email} />
          <Input type="text" placeholder="Address"
            value={contact.address} onChange={this.inputChange.bind(this,"address")}/>
          <FormMessage message={this.state.message}/>
          <div className="input padding-top-0">
            <input type="submit" />
          </div>
          <div className="input padding-top-0">
            <button onClick={this.props.onCancel}>Cancel</button>
          </div>
        </form>
      </div>
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

class FormMessage extends Component {
  render() {
    const messageClass = this.props.message.type === "success" ?
      "message-success" : "message-fail";
    return(
      <div className="form-message">
        { this.props.message.text &&
          <p className={messageClass}>{this.props.message.text}</p>
        }
      </div>
    )
  }
}

export default App;
