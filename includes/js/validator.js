
/**
 * This class represents the Validator class with all properties and methods.
 * The Validator class validates input fields as well as passwords and email addresses and throws form errors if necessary.
 * If a button with the Css class: submit is present in a form, it will be disabled or enabled.
 * The event handler for form validation is called when an object is instantiated.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   const validator = new Validator();
 *
 */
class Validator {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   const validator = new Validator();
 *
 */
  constructor() {
    this.formErrors    = [];
    this.fields        = window[ appAlias ].fields;
    this.fieldTypes    = [ 'input', 'select', 'textarea' ];
    this.passwordRules = {
      'passwordHasNumbers': window[ appAlias ].passwordRules.passwordHasNumbers,
      'passwordHasCapitalLetters': window[ appAlias ].passwordRules.passwordHasCapitalLetters,
      'passwordHasLowercaseLetters': window[ appAlias ].passwordRules.passwordHasLowercaseLetters,
      'passwordHasSpecialCharacters': window[ appAlias ].passwordRules.passwordHasSpecialCharacters
    };

    this.registerEventHandler();

    return;
  }

/**
 * This method is the default getter of the class.
 *
 * @public
 *
 * @param     {string}   property   The property of the value
 * @return    {*}        value      The value of the property
 *
 * @example   let value = validator.get( property );
 *
 * @see Validator#set
 *
 */
  get( property ) {
    return this[ property ];
  }

/**
 * This method is the default setter for the class.
 *
 * @public
 *
 * @param     {string}   property   The property that you want to set
 * @param     {*}        value      The value you want to set to the property
 * @return    {void}
 *
 * @example   validator.set( property, value );
 *
 * @see Validator#get
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This method registers an event handler that searches the page for forms and form fields
 * and this is automatically validated.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   validator.registerEventHandler();
 *
 */
  registerEventHandler() {
    window.addEventListener( 'load', () => {
      this.validateFields();

      return;
    } );

    return;
  }

/**
 * This method goes through all forms and their input fields and attaches three to each input field
 * Event handlers. One when changing the input field, one when leaving the input field and one
 * when pressing a key in the input field.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   validator.validateFields();
 *
 */
  validateFields() {
    this._validateFields();

    const forms = document.querySelectorAll( 'form' );

    for( let k = 0; k < forms.length; k++ ) {
      for( let i = 0; i < this.fieldTypes.length; i++ ) {
        const fieldObjects = forms[ k ].querySelectorAll( this.fieldTypes[ i ] );

        if( fieldObjects == null ) continue;

        for( let j = 0; j < fieldObjects.length; j++ ) {
          if( fieldObjects[ j ] == null ) continue;

          fieldObjects[ j ].addEventListener( 'change', ( event ) => { this._validateFields(); }, false );
          fieldObjects[ j ].addEventListener( 'keyup', ( event ) => { this._validateFields(); }, false );
          fieldObjects[ j ].addEventListener( 'blur', ( event ) => { this._validateFieldSetFormError( event ); }, false );
        }
      }
    }

    return;
  }

/**
 * This method sets or removes a FormError from the input fields of a form when typing with the keyboard or changing the field.
 *
 * @private
 *
 * @param     {object}  event   The triggering event
 * @return    {void}
 *
 * @example   validator._validateFieldSetFormError( event );
 *
 */
  _validateFieldSetFormError( event ) {
    const form = event.target.closest( 'form' );

    if( this._validateField( event.target.name, form ) ) {
      event.target.classList.remove( 'form-error' );
    } else {
      event.target.classList.add( 'form-error' );
    }

    return;
  }

/**
 * This method checks the field passed with the input field name whether it meets all the guidelines
 * the input field is stored (fields.json).
 *
 * @private
 *
 * @param     {string}   key            The name of the input field
 * @param     {object}   form           The form in which the key is located
 * @return    {boolean}  formIsValide   The result of the check, true: is valid, false: is not valid
 *
 * @example   let formIsValide = validator._validateField( key, form );
 *
 */
  _validateField( key, form ) {
    const fields      = this.fields;
    let formIsValide  = true;

    if( typeof key != 'string' || key == '' ) return true;
    if( typeof fields  != 'object' || fields == null ) return true;
    if( typeof fields[ key ] == 'undefined' || fields[ key ] == null ) return true;

    if( ! fields[ key ].mandatory ) return true;
    const field = form.querySelector( fields[ key ].element + '[name=\'' + key + '\']' );

    if( typeof( field ) != 'object' || field == null ) return true;

    if( fields[ key ].type == 'checkbox' ) {
      if( ! field.checked ) formIsValide = false;
    } else if( fields[ key ].type == 'password' ) {
      const intMinLength = typeof fields[ key ].minLength == 'number' ? fields[ key ].minLength : 1;
      if( typeof( field.value ) != 'string' || field.value == '' ) formIsValide = false;
      if( field.value.length < intMinLength ) formIsValide = false;
      const password2 = form.querySelector( fields[ key ].element + '[name=\'' + key + '2\']' );
      if( password2 != null && typeof password2.value == 'string' && field.value != password2.value ) formIsValide = false;
      if( typeof fields[ key ].validatePasswordSecurity == 'boolean' && fields[ key ].validatePasswordSecurity ) {
        if( ! this._validatePassword( field.value ) ) formIsValide = false;
      }
    } else {
      const intMinLength = typeof fields[ key ].minLength == 'number' ? fields[ key ].minLength : 1;
      if( typeof( field.value ) != 'string' || field.value == '' ) formIsValide = false;
      if( field.value.length < intMinLength ) formIsValide = false;
    }
    if( ! formIsValide ) return false;
    if( fields[ key ].mail && ! this._validateEmail( field.value ) ) formIsValide = false;
    if( formIsValide ) field.classList.remove( 'form-error' );

    return formIsValide;
  }

/**
 * This method loops through all forms and their fields on the current page and validates the input.
 * Furthermore, it switches the buttons with the Css class: Submit to disable or enable.
 *
 * @private
 *
 * @return    {void}
 *
 * @example   validator._validateFields();
 *
 */
  _validateFields() {
    const fields = this.fields;
    const forms  = document.querySelectorAll( 'form' );

    for( let u = 0; u < forms.length; u++ ) {
      let formIsValide = true;

      if( typeof( fields ) != 'object' || fields == null ) return;

      for ( const key in fields ) {
        formIsValide = this._validateField( key, forms[ u ] );

        if( ! formIsValide ) {
          if( forms[ u ].querySelector( '.submit' ) == null ) return;
          forms[ u ].querySelector( '.submit' ).setAttribute( 'disabled', 'disabled' );
          break;
        }
      }

      if( formIsValide ) {
        if( forms[ u ].querySelector( '.submit' ) == null ) return;
        forms[ u ].querySelector( '.submit' ).removeAttribute( 'disabled' );
      } else {
        if( forms[ u ].querySelector( '.submit' ) == null ) return;
        forms[ u ].querySelector( '.submit' ).setAttribute( 'disabled', 'disabled' );
      }
    }

    return;
  }

/**
 * This method is specifically for passwords and checks the password against the stored rules.
 *
 * @private
 *
 * @param     {string}   password   The password
 * @return    {boolean}  isValide   The result of the check, true: is valid, false: is not valid
 *
 * @example   let isValide = validator._validatePassword( password );
 *
 */
  _validatePassword( password ) {
    if( this.passwordRules.passwordHasNumbers ) {
      const regexNumbers = /[0-9]/;
      if( ! regexNumbers.test( password ) ) return false;
    }

    if( this.passwordRules.passwordHasCapitalLetters ) {
      const regexCapitalLetters = /[A-Z]/;
      if( ! regexCapitalLetters.test( password ) ) return false;
    }

    if( this.passwordRules.passwordHasLowercaseLetters ) {
      const regexLowercaseLetters = /[a-z]/;
      if( ! regexLowercaseLetters.test( password ) ) return false;
    }

    if( this.passwordRules.passwordHasSpecialCharacters ) {
      const regexSpecialCharacters = /[^a-zA-Z0-9\s]/;
      if( ! regexSpecialCharacters.test( password ) ) return false;
    }

    return true;
  }

/**
 * This method checks an email address for validity and returns the result of the check.
 *
 * @private
 *
 * @param     {string}   email      The email address
 * @return    {boolean}  isValide   The result of the check, true: is valid, false: is not valid
 *
 * @example   let isValide = validator._validateEmail( email );
 *
 */
  _validateEmail( email ) {
    return String( email ).toLowerCase().match( /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ );
  }

/**
 * This method loops through the Form Error array and sets or resets the Form Error at the input field.
 *
 * @public
 *
 * @param     {object}    formErrors      The array with Form Errors
 * @return    {void}
 *
 * @example   validator.manageFormErrors( formErrors );
 *
 */
  manageFormErrors( formErrors ) {
    for( let i = 0; i < formErrors.length; i++ ) {
      if( document.querySelector( formErrors[ i ].field ) == null ) continue;
      this.formErrors.push( formErrors[ i ] );
      document.querySelector( formErrors[ i ].field ).classList.add( 'form-error' );
    }

    return;
  }

/**
 * This method resets the Errors form in all input fields of all forms.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   validator.resetFormErrors();
 *
 */
  resetFormErrors() {
    const formErrors = document.querySelectorAll( '.form-error' );

    for( let i = 0; i < formErrors.length; i++ ) {
      formErrors[ i ].classList.remove( 'form-error' );
    }

    return;
  }

}