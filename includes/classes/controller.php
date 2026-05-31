<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/presentation.php' );
include_once ( __DIR__ . '/../classes/player.php' );

class Controller {
  protected string        $resultType;
  protected string        $viewName;
  protected object        $viewObject;
  protected string        $objectId;
  protected string        $className;
  protected array         $actions;
  protected array         $templates;
  protected object        $config;
  protected Presentation  $presentationObject;
  protected string        $role;
  protected object        $object;
  protected object        $response;

  public function __construct() {
    $this->init();

    return;
  }

  private function init() : void {
    $this->config             = BaseObject::getConfig();
    $this->presentationObject = new Presentation();
    $this->role               = $this->config->defaultRole;
    $this->response           = new stdClass();
    $this->response->object   = new stdClass();
    $this->response->result   = new stdClass();
    $this->response->errors   = [];

    $this->resultType         = isset( $_GET[ 'result' ] ) && $_GET[ 'result' ] != '' ? $_GET[ 'result' ] : 'content';
    $this->viewName           = isset( $_GET[ 'view' ] ) ? $_GET[ 'view' ] : 'login'; //$this->config->defaultView;
    $this->objectId           = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : '';
    $this->viewObject         = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'views/' . ucfirst( $this->viewName ) . '.json' );
    $this->className          = $this->viewObject->class;
    $this->templates          = $this->viewObject->templates;
    $this->actions            = $this->viewObject->actions;

    return;
  }

  public function getPresentationObject() : Presentation {
    return $this->presentationObject;
  }

  public function getViewObject() : object {
    return $this->viewObject;
  }

  public function getResultType() : string {
    return $this->resultType;
  }

  public function setObject( object $objObject ) : void {
    $this->object = $objObject;

    return;
  }

  public function setRole( string $strRole ) : void {
    $this->role = $strRole;

    return;
  }

  public function execute() : mixed {
    if( isset( $_GET[ 'result' ] ) ) {
      $this->resultType = 'json';

      return $this->json();
    }

    $this->resultType = 'content';

    return $this->view();
  }

  private function checkRole() : void {
    if( ! in_array( $this->config->defaultRole, $this->viewObject->roles ) ) {
      $strSetRole =$this->config->setRole;
      $strSetRole( $this );
    }

    return;
  }

  public function view() : string {
    $this->checkRole();

    if( ! in_array( $this->role, $this->viewObject->roles ) )  header( 'Location: index.php?view=' . $this->config->defaultView );

    $this->executeActions();

    return $this->renderView();
  }

  public function json() : string {
    $this->checkRole();

    if( ! in_array( $this->role, $this->viewObject->roles )   ) {
        $objError           = new stdClass();
        $objError->message  = 'Zugriff verweigert';
        $objError->redirect = 'index.php?view=' . $this->config->defaultView;

        array_push( $this->response->errors, $objError );

        return json_encode( $this->response );
    }

    $this->executeActions();
    $this->response->object = $this->savePostData();
    $this->responseData();
    $this->presentationObject->getJsonHeader();

    return json_encode( $this->response );
  }

  public function savePostData() {
    $strClass     = isset( $_POST[ 'class' ] ) ? $_POST[ 'class' ] : null;
    $strId        = isset( $_POST[ 'id' ] ) ? $_POST[ 'id' ] : null;
    $strProperty  = isset( $_POST[ 'property' ] ) ? $_POST[ 'property' ] : null;
    $strFile      = isset( $_FILES[ 'files' ] ) ? $_FILES[ 'files' ] : null;
    $strPath      = __DIR__ . '/../files/';

    if( ! isset( $strClass ) || ! isset( $strId ) || ! isset( $strProperty ) || ! isset( $strFile ) ) return;
    if( ! file_exists( $strPath . lcfirst( $strClass ) . '/' ) ) mkdir( $strPath . lcfirst( $strClass ) );
    if( ! file_exists( $strPath . lcfirst( $strClass ) . '/' . $strId ) ) mkdir( $strPath . lcfirst( $strClass ) . '/' . $strId );

    $objObject    = new $strClass( $strId );
    $strPath      = $strPath . lcfirst( $strClass ) . '/' . $strId . '/';
    $strTmpName   = $_FILES[ 'files' ][ 'tmp_name' ];
    $strName      = basename( $_FILES[ 'files' ][ 'name' ] );
    $strName      = $objObject->newId( 'file' ) . '_' . $strName;

    $objObject->set( $strProperty, $strName );

    move_uploaded_file( $strTmpName, $strPath . $strName );

    if( isset( $_POST[ 'methode' ] ) ) {
      $_POST[ 'methode' ]( $strName );
      $objObject->fillObject();
    }

    return $objObject;
  }

  public function responseData() : void {
    $objRequestObject             = json_decode( file_get_contents( 'php://input' ) );

    if( ! isset( $objRequestObject ) ) return;

    $objRequestObject->controller = $this;
    $strClassName                 = isset( $objRequestObject->class ) && $objRequestObject->class != '' ? $objRequestObject->class : null;
    $strMethode                   = isset( $objRequestObject->methode ) && $objRequestObject->methode != '' ? $objRequestObject->methode : null;
    $strObjectId                  = isset( $objRequestObject->id ) && $objRequestObject->id != '' ? $objRequestObject->id : null;

    if( isset( $strObjectId ) ) {
      $objObject              = new $strClassName( $strObjectId );
      $this->response->result = $objObject->$strMethode( $objRequestObject );
    } else {
      $this->response->result = $strClassName::$strMethode( $objRequestObject );
    }

    return;
  }

  private function renderView() : string {
    $strContent = '';

    $this->presentationObject->assignTemplateVar( 'fields', 'default', null, json_encode( BaseObject::fields( $this->className ) ) );
    $this->presentationObject->assignTemplateVar( 'view', 'default', null, json_encode( $this->viewObject ) );
    $this->presentationObject->assignTemplateVar( 'class', 'default', null, $this->className );
    $this->presentationObject->assignTemplateVar( 'id', 'default', null, isset( $strId ) ? $strId : '' );

    if( isset( $this->object ) ) {
      $this->presentationObject->assignTemplateVar( $this->object->serializeObject( $this->object ), $this->className, BaseObject::fields( $this->className ) );
    }

    for( $i = 0; $i < count( $this->templates ); $i++ ) {
      $strContent .= $this->presentationObject->processTemplate( $this->templates[ $i ] );
    }

    return $strContent;
  }

  private function executeActions() : void {
    for( $i = 0; $i < count( $this->actions ); $i++ ) {
      $this->objectId    = ! isset( $this->objectId ) && isset( $this->object ) ? $this->object->id() : $this->objectId;
      $arrActionParts = explode( '::', $this->actions[ $i ] );

      if( isset( $strObjectId ) && $arrActionParts[ 0 ] == $this->className ) {
        $objObject        = new $this->className( $strObjectId );
        $strAction        = $arrActionParts[ 1 ];
        $objObject->$strAction( $this );
      } else {
        $this->actions[ $i ]( $this );
      }
    }

    return;
  }


}

// EOF