import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import validators from './validators.js';
import Form from './form.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      term: '',
      sortBy: undefined
    }

    this.addContact = this.addContact.bind(this);
    this.deleteContact = this.deleteContact.bind(this);
    this.editContact = this.editContact.bind(this);
    this.filterContacts = this.filterContacts.bind(this);
    this.sortContacts = this.sortContacts.bind(this);
    this.onTermChange = this.onTermChange.bind(this);
  }

  componentDidMount() {
    this.fetchContacts();
  }

  fetchContacts() {
    const self = this;
    axios.get('/contacts.json')
      .then(function (response) {
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
        picture: picture,
        filtered: true
      }
    })
  }

  addContact(contact) {
    const contacts = this.state.contacts.slice();
    let maxId = 0;
    contacts.forEach((contact) => {
      if (contact.id > maxId) {
        maxId = contact.id;
      }
    })
    contact.id = ++maxId;
    contact.picture = 'http://placebear.com/187/187';
    contact.filtered = JSON.stringify(contact).toLowerCase().includes(this.state.term.toLowerCase()) ?
      true : false;

    const { sortBy } = this.state;
    if (sortBy) {
      this.sortedInsert(sortBy, contact, contacts);
    } else {
      contacts.push(contact);
    }

    this.setState({ contacts });
  }

  sortedInsert(sortBy, contact, contacts) {
    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i][sortBy] >= contact[sortBy]){
        contacts.splice(i,0,contact);
        return;
      }
    }
    contacts.splice(0,0,contact);
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
    for (let i = 0; i < this.state.contacts.length; i++) {
      if (this.state.contacts[i].id === contact.id) {
        const contacts = this.state.contacts.slice();
        Object.getOwnPropertyNames(contact).forEach((property) => {
          contacts[i][property] = contact[property];
        });
        contacts[i].filtered = JSON.stringify(contact).toLowerCase().includes(this.state.term.toLowerCase()) ?
          true : false;
        const { sortBy } = this.state;
        if ( sortBy ) {
          let contact = contacts.splice(i,1)[0];
          console.log(contact);
          this.sortedInsert(sortBy, contact, contacts);
        }
        this.setState({ contacts });
        return true;
      }
    }
  }

  onTermChange(event) {
    this.setState({
      term: event.target.value
    })
    this.filterContacts(event.target.value);
  }

  filterContacts(term) {
    console.log('term',term);
    const contacts = this.state.contacts.slice();
    contacts.forEach((contact) => {
      contact.filtered =
        JSON.stringify(contact).toLowerCase().includes(term.toLowerCase()) ?
          true : false;
    })
    this.setState({ contacts });
  }

  sortContacts(propName) {
    const contacts = this.state.contacts.slice();
    contacts.sort((a, b) => {
      if (a[propName] > b[propName]){
        return 1;
      }

      if (a[propName] < b[propName]){
        return -1;
      }

      return 0;
    })
    this.setState({ contacts });
    this.setState({
      sortBy: propName
    });
  }

  render() {
    return (
      <div className="App">
        <AddContact onSubmit={this.addContact}/>
        <SearchContacts onChange={this.onTermChange}
          term={this.state.term}/>
        <ContactsList contacts={this.state.contacts}
          onDelete={this.deleteContact}
          onEdit={this.editContact}
          sort={this.sortContacts}/>
      </div>
    );
  }
}

class ContactsList extends Component {
  render() {

    const contacts = this.props.contacts.map((contact) => {
      if (contact.filtered) {
        return <Contact contact={contact} key={contact.id}
          onDelete={this.props.onDelete}
          onEdit={this.props.onEdit}/>
      }
    });

    return (
      <div>
        <ContactsListHeader sort={this.props.sort}/>
        {contacts}
      </div>
    )
  }
}

class ContactsListHeader extends Component {
  render () {
    return (
      <div className="contact-row contact-header">
        <div className="contact-cell">
          <div className="contact-image">
          </div>
        </div>
        <div className="contact-cell"
          onClick={this.props.sort.bind(this,'name')}>
          Name
        </div>
        <div className="contact-cell"
          onClick={this.props.sort.bind(this,'phone')}>
          Phone
        </div>
        <div className="contact-cell"
          onClick={this.props.sort.bind(this,'email')}>
          Email
        </div>
        <div className="contact-cell"
          onClick={this.props.sort.bind(this,'address')}>
          Address
        </div>
        <div className="contact-cell">
        </div>
      </div>
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
      this.onEdit = this.onEdit.bind(this);
  }

  editModeSwitch() {
    const editMode = this.state.editMode ? false : true;
    this.setState({ editMode });
  }

  onEdit(contact) {
    if (this.props.onEdit(contact)) {
      this.editModeSwitch()
    }
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
          <EditContact contact={contact}
            onCancel={this.editModeSwitch}
            onSubmit={this.onEdit}/>
      )
    }
  }
}

class AddContact extends Component {

  render() {
    const fields = [
      {
        name: 'name',
        type: 'text',
        validators: [
          {
            func: validators.notEmpty,
            error: 'Name is required'
          }
        ],
        val: ''
      },
      {
        name: 'email',
        type: 'text',
        validators: [
          {
            func: validators.email,
            error: 'Not valid email'
          }
        ],
        val: ''
      },
      {
        name: 'phone',
        type: 'text',
        validators: undefined,
        val: ''
      },
      {
        name: 'address',
        type: 'text',
        validators: undefined,
        val: ''
      }
    ]
    return(
      <Form fields={fields} onSubmit={this.props.onSubmit}/>
    )
  }
}

class EditContact extends Component {

  render() {
    const fields = [
      {
        name: 'id',
        type: 'text',
        validators: undefined,
        val: this.props.contact.id,
        disabled: true
      },
      {
        name: 'name',
        type: 'text',
        validators: [
          {
            func: validators.notEmpty,
            error: 'Name is required'
          }
        ],
        val: this.props.contact.name
      },
      {
        name: 'email',
        type: 'text',
        validators: [
          {
            func: validators.email,
            error: 'Not valid email'
          }
        ],
        val: this.props.contact.email
      },
      {
        name: 'phone',
        type: 'text',
        validators: undefined,
        val: this.props.contact.phone
      },
      {
        name: 'address',
        type: 'text',
        validators: undefined,
        val: this.props.contact.address
      }
    ]
    return(
      <Form fields={fields} onSubmit={this.props.onSubmit}/>
    )
  }
}

class SearchContacts extends Component {
  render() {
    return (
      <div className="contacts-search">
        <input value={this.props.term}
          type="text"
          onChange={this.props.onChange}
          placeholder="Contacts search"/>
      </div>
    )
  }
}

export default App;
