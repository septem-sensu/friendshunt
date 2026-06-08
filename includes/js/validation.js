/**
 * Form Field Validation Package for the Friends Hunt App.
 *
 * This Package represents the Form Field Validation Package for the Friends Hunt App with his Functions.
 *
 * @public
 * @module        validation.js
 * @namespace     friendshunt
 * @access        public
 * @author        Markus Götz <info@septem-sensu.de>
 * @since         2026-06-06
 * @version       0.1.0
 * @copyright     2026 Markus Götz <info@septem-sensu.de>
 *
*/
window[ appAlias ]            = window[ appAlias ] || {};
window[ appAlias ].methods    = window[ appAlias ].methods || {};
window[ appAlias ].formErrors = window[ appAlias ].formErrors || [];

/**
 * This Function loop all Form Field and validate against the Field Definitions after a Key Event.
 * The Key Event Listener are registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       validateFields
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.validateFields();
 *
*/
window[ appAlias ].methods.validateFields = function() {
  window[ appAlias ].methods._validateFields();

  var arrFieldTypes = [ 'input', 'select', 'textarea' ];
  var arrForms      = document.querySelectorAll( 'form' );

  for( var k = 0; k < arrForms.length; k++ ) {
    for( var i = 0; i < arrFieldTypes.length; i++ ) {
      var arrFieldObjects = arrForms[ k ].querySelectorAll( arrFieldTypes[ i ] );

      if( arrFieldObjects == null ) continue;

      for( var j = 0; j < arrFieldObjects.length; j++ ) {
        if( arrFieldObjects[ j ] == null ) continue;
        arrFieldObjects[ j ].addEventListener( 'change', window[ appAlias ].methods._validateFields, false );
        arrFieldObjects[ j ].addEventListener( 'keyup', window[ appAlias ].methods._validateFields, false );
        arrFieldObjects[ j ].addEventListener( 'blur', window[ appAlias ].methods._validateFieldSetFormError, false );
      }
    }
  }

  return;
};

/**
 * This Function is a validation Helper Function to set or remove a Form Error to the Form Field after a Key Event.
 *
 * @function
 * @public
 * @name       _validateFieldSetFormError
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods._validateFieldSetFormError();
 *
*/
window[ appAlias ].methods._validateFieldSetFormError = function() {
  var objForm = this.closest( 'form' );

  if( window[ appAlias ].methods._validateField( this.name, objForm ) ) {
    this.classList.remove( 'form-error' );
  } else {
    this.classList.add( 'form-error' );
  }

  return;
};

/**
 * This Function is a validation Helper Function and is used to validate a Form Field Value with the given Key from the Field Definition and returns a boolean value.
 *
 * @function
 * @public
 * @name       _validateField
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}   strKey            The Form Field Key of the Field Definition.
 * @return     {boolean}  boolFormIsValide  The validation result (true = Field Value is Valide, false = Field Value is not Valide).
 * @example    boolFormIsValide = friendshunt.methods._validateField( strKey );
 *
*/
window[ appAlias ].methods._validateField = function( strKey, objForm ) {
  var arrFields        = window[ appAlias ].fields;
  var boolFormIsValide = true;

  if( typeof strKey != 'string' || strKey == '' ) return true;
  if( typeof arrFields  != 'object' || arrFields == null ) return true;
  if( typeof arrFields[ strKey ] == 'undefined' || arrFields[ strKey ] == null ) return true;

  if( ! arrFields[ strKey ].mandatory ) return true;
  var objField = objForm.querySelector( arrFields[ strKey ].element + '[name=\'' + strKey + '\']' );

  if( typeof( objField ) != 'object' || objField == null ) return true;

  if( arrFields[ strKey ].type == 'checkbox' ) {
    if( ! objField.checked ) boolFormIsValide = false;
  } else if( arrFields[ strKey ].type == 'password' ) {
    var intMinLength = typeof arrFields[ strKey ].minLength == 'number' ? arrFields[ strKey ].minLength : 1;
    if( typeof( objField.value ) != 'string' || objField.value == '' ) boolFormIsValide = false;
    if( objField.value.length < intMinLength ) boolFormIsValide = false;
    var objPassword2 = objForm.querySelector( arrFields[ strKey ].element + '[name=\'' + strKey + '2\']' );
    if( objPassword2 != null && typeof objPassword2.value == 'string' && objPassword2.value.length > 0 && objField.value != objPassword2.value ) boolFormIsValide = false;
    if( typeof arrFields[ strKey ].validatePasswordSecurity == 'boolean' && arrFields[ strKey ].validatePasswordSecurity ) {
      if( ! window[ appAlias ].methods._validatePassword( objField.value ) ) boolFormIsValide = false
    }
  } else {
    var intMinLength = typeof arrFields[ strKey ].minLength == 'number' ? arrFields[ strKey ].minLength : 1;
    if( typeof( objField.value ) != 'string' || objField.value == '' ) boolFormIsValide = false;
    if( objField.value.length < intMinLength ) boolFormIsValide = false;
  }
  if( ! boolFormIsValide ) return false;
  if( arrFields[ strKey ].mail && ! window[ appAlias ].methods._validateEmail( objField.value ) ) boolFormIsValide = false;
  if( boolFormIsValide ) objField.classList.remove( 'form-error' );

  return boolFormIsValide;
};

/**
 * This Function is a validation Helper Function and validate the Fields, controlls the other Helper Functions and enable / disable the Submit Buttons.
 *
 * @function
 * @public
 * @name       _validateFields
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods._validateFields();
 *
*/
window[ appAlias ].methods._validateFields = function() {
  var arrFields        = window[ appAlias ].fields;
  var arrForms         = document.querySelectorAll( 'form' );

  for( var u = 0; u < arrForms.length; u++ ) {
    var boolFormIsValide = true;

    if( typeof( arrFields ) != 'object' || arrFields == null ) return;

    for ( var strKey in arrFields ) {
      boolFormIsValide = window[ appAlias ].methods._validateField( strKey, arrForms[ u ] );

      if( ! boolFormIsValide ) {
        if( arrForms[ u ].querySelector( '.submit' ) == null ) return;
        arrForms[ u ].querySelector( '.submit' ).setAttribute( 'disabled', 'disabled' );
        break;
      }
    }

    if( boolFormIsValide ) {
      if( arrForms[ u ].querySelector( '.submit' ) == null ) return;
      arrForms[ u ].querySelector( '.submit' ).removeAttribute( 'disabled' );
    } else {
      if( arrForms[ u ].querySelector( '.submit' ) == null ) return;
      arrForms[ u ].querySelector( '.submit' ).setAttribute( 'disabled', 'disabled' );
    }
  }

  return;
};

/**
 * This Function is a validation Helper Function for validate Passoword.
 *
 * @function
 * @public
 * @name       _validatePassword
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}   strPassword             The Passowrd Form Field Value.
 * @return     {boolean}  boolFormFieldIsValide   The validation result (true = Field Value is Valide, false = Field Value is not Valide).
 * @example    boolFormFieldIsValide = friendshunt.methods._validatePassword( strPassword );
 *
*/
window[ appAlias ].methods._validatePassword = function( strPassword ) {
  if( window[ appAlias ].passwordRules.passwordHasNumbers ) {
    var regexNumbers = /[0-9]/;
    if( ! regexNumbers.test( strPassword ) ) return false;
  }

  if( window[ appAlias ].passwordRules.passwordHasCapitalLetters ) {
    var regexCapitalLetters = /[A-Z]/;
    if( ! regexCapitalLetters.test( strPassword ) ) return false;
  }

  if( window[ appAlias ].passwordRules.passwordHasLowercaseLetters ) {
    var regexLowercaseLetters = /[a-z]/;
    if( ! regexLowercaseLetters.test( strPassword ) ) return false;
  }

  if( window[ appAlias ].passwordRules.passwordHasSpecialCharacters ) {
    var regexSpecialCharacters = /[^a-zA-Z0-9\s]/;
    if( ! regexSpecialCharacters.test( strPassword ) ) return false;
  }

  return true;
};

/**
 * This Function is a validation Helper Function for validate E-mail Addresses.
 *
 * @function
 * @public
 * @name       _validateEmail
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}   strEmail               The E-Mail Address Form Field Value.
 * @return     {boolean}  boolFormFieldIsValide  The validation result (true = Field Value is Valide, false = Field Value is not Valide).
 * @example    boolFormFieldIsValide = friendshunt.methods._validateEmail( strEmail );
 *
*/
window[ appAlias ].methods._validateEmail = function( strEmail ) {
  return String( strEmail ).toLowerCase().match( /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ );
};

/**
 * This Function manage and controlls the Form Field Errors of the current Page.
 *
 * @function
 * @public
 * @name       manageFormErrors
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {array}   arrFormErrors   The Array with the Form Field Errors.
 * @return     {void}
 * @example    friendshunt.methods.manageFormErrors( arrFormErrors );
 *
*/
window[ appAlias ].methods.manageFormErrors = function( arrFormErrors ) {
  for( var i = 0; i < arrFormErrors.length; i++ ) {
    if( document.querySelector( arrFormErrors[ i ].field ) == null ) continue;
    window[ appAlias ].formErrors.push( arrFormErrors[ i ] );
    document.querySelector( arrFormErrors[ i ].field ).classList.add( 'form-error' );
  }

  return;
};

/**
 * This Function remove all Form Field Errors of the current Page.
 *
 * @function
 * @public
 * @name       resetFormErrors
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.resetFormErrors();
 *
*/
window[ appAlias ].methods.resetFormErrors = function() {
  var arrFormErrors = document.querySelectorAll( '.form-error' );

  for( var i = 0; i < arrFormErrors.length; i++ ) {
    document.querySelector( arrFormErrors[ i ].field ).classList.remove( 'form-error' );
  }

  return;
};

window.addEventListener( 'load', function() {
  window[ appAlias ].methods.validateFields();

  return;
} );

window.addEventListener( 'pageshow', function() {

  return;
} );