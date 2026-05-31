window[ appAlias ]            = window[ appAlias ] || {};
window[ appAlias ].methods    = window[ appAlias ].methods || {};
window[ appAlias ].formErrors = window[ appAlias ].formErrors || [];

window[ appAlias ].methods.validateFields = function() {
  window[ appAlias ].methods._validateFields();

  var arrFieldTypes = [ 'input', 'select', 'textarea' ];

  for( var i = 0; i < arrFieldTypes.length; i++ ) {
    var arrFieldObjects = document.querySelectorAll( arrFieldTypes[ i ] );

    if( arrFieldObjects == null ) continue;

    for( var j = 0; j < arrFieldObjects.length; j++ ) {
      if( arrFieldObjects[ j ] == null ) continue;
      arrFieldObjects[ j ].addEventListener( 'change', window[ appAlias ].methods._validateFields, false );
      arrFieldObjects[ j ].addEventListener( 'keyup', window[ appAlias ].methods._validateFields, false );
      arrFieldObjects[ j ].addEventListener( 'blur', window[ appAlias ].methods._validateFieldSetFormError, false );
    }
  }

  return;
};

window[ appAlias ].methods._validateFieldSetFormError = function() {
  if( window[ appAlias ].methods._validateField( this.name ) ) {
    this.classList.remove( 'form-error' );
  } else {
    this.classList.add( 'form-error' );
  }

  return;
};

window[ appAlias ].methods._validateField = function( strKey ) {
  var arrFields        = window[ appAlias ].fields;
  var boolFormIsValide = true;

  if( typeof strKey != 'string' || strKey == '' ) return true;
  if( typeof arrFields  != 'object' || arrFields == null ) return true;
  if( typeof arrFields[ strKey ] == 'undefined' || arrFields[ strKey ] == null ) return true;

  if( ! arrFields[ strKey ].mandatory ) return true;
  var objField = document.querySelector( arrFields[ strKey ].element + '[name=\'' + strKey + '\']' );

  if( typeof( objField ) != 'object' || objField == null ) return true;
  if( arrFields[ strKey ].type == 'checkbox' ) {
    if( ! objField.checked ) boolFormIsValide = false;
  } else {
    var intMinLength = typeof arrFields[ strKey ].min_length == 'number' ? arrFields[ strKey ].min_length : 1;
    if( typeof( objField.value ) != 'string' || objField.value == '' ) boolFormIsValide = false;
    if( objField.value.length < intMinLength ) boolFormIsValide = false;
  }
  if( ! boolFormIsValide ) return false;
  if( arrFields[ strKey ].mail && ! window[ appAlias ].methods._validateEmail( objField.value ) ) boolFormIsValide = false;
  if( boolFormIsValide ) objField.classList.remove( 'form-error' );

  return boolFormIsValide;
};

window[ appAlias ].methods._validateFields = function() {
  var arrFields        = window[ appAlias ].fields;
  var boolFormIsValide = true;
  
  if( typeof( arrFields ) != 'object' || arrFields == null ) return;

  for ( var strKey in arrFields ) {
    boolFormIsValide = window[ appAlias ].methods._validateField( strKey );

    if( ! boolFormIsValide ) {
      if( document.querySelector( '.submit' ) == null ) return;
      document.querySelector( '.submit' ).setAttribute( 'disabled', 'disabled' );
      return false;
    }
  }

  var objPassword1  = document.querySelector( 'input[name="password"]' );
  var objPassword2  = document.querySelector( 'input[name="password2"]' );

  if( objPassword1 != null && objPassword2 != null ) {
    if( objPassword1.value != objPassword2.value ) boolFormIsValide = false;
    if( arrFields.password.validatePasswordSecurity && ! window[ appAlias ].methods._validatePassword( objPassword1.value ) ) boolFormIsValide = false;
  }

  if( boolFormIsValide ) {
    if( document.querySelector( '.submit' ) == null ) return; 
    document.querySelector( '.submit' ).removeAttribute( 'disabled' );
  } else {
    if( document.querySelector( '.submit' ) == null ) return;
    document.querySelector( '.submit' ).setAttribute( 'disabled', 'disabled' );
  }

  return;
};

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

window[ appAlias ].methods._validateEmail = function( strEmail ) {
  return String( strEmail ).toLowerCase().match( /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ );
};

window[ appAlias ].methods.manageFormErrors = function( arrFormErrors ) {
  for( var i = 0; i < arrFormErrors.length; i++ ) {
    if( document.querySelector( arrFormErrors[ i ].field ) == null ) continue;
    window[ appAlias ].formErrors.push( arrFormErrors[ i ] );
    document.querySelector( arrFormErrors[ i ].field ).classList.add( 'form-error' );
  }

  return;
};

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