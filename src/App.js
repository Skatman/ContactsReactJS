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

  render() {
    return (
      <div className="App">
        <AddContact onSubmit={this.addContact}/>
        <ContactsList contacts={this.state.contacts} />
      </div>
    );
  }
}

class ContactsList extends Component {
  render() {
    return (
      this.props.contacts.map((contact) => {
        return <Contact contact={contact} key={contact.id}/>
      })
    )
  }
}

class Contact extends Component {
  render() {
    const { contact } = this.props;
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
      </div>
    )
  }
}

class AddContact extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contact: this.contactStateDefaults(),
      message: {
        type: undefined,
        text: ''
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

    if (this.validateForm() === true) {
      let contact = {};
      Object.getOwnPropertyNames(this.state.contact).forEach((property) => {
        contact[property] = this.state.contact[property];
      });
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
    if (contact.name.length === 0) {
      messages.push('Name should not be empty');
    }
    if (contact.email.length > 0 && !this.validateEmail(contact.email)) {
      messages.push('Email should be valid');
    }
    if (messages.length > 0) {
      const text = messages.reduce((outPut, message) => {
        return outPut = `${outPut}${message}\n`;
      }, '');
      message = {
        type: 'fail',
        text: text
      }
    } else {
      message = {
        type: 'success',
        text: 'Contact has been added successfully'
      }
    }
    this.setState({ message });
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
          <input type="text" placeholder="Name"
            value={contact.name} onChange={this.inputChange.bind(this,"name")}/>
          <input type="text" placeholder="Phone"
            value={contact.phone} onChange={this.inputChange.bind(this,"phone")}/>
          <input type="text" placeholder="Email"
            value={contact.email} onChange={this.inputChange.bind(this,"email")}/>
          <input type="text" placeholder="Address"
            value={contact.address} onChange={this.inputChange.bind(this,"address")}/>
          <input type="submit" />
          <FormMessage message={this.state.message}/>
        </form>
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
