<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/presentation.php' );

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

  public function __construct() {
    $this->config             = BaseObject::getConfig();
    $this->presentationObject = new Presentation();
    $this->role               = $this->config->defaultRole;

    return;
  }

  public function getPresentationObject() : Presentation {
    return $this->presentationObject;
  }

  public function setObject( object $objObject ) : void {
    $this->object = $objObject;

    return;
  }

  public function view() : string {
    $this->resultType = isset( $_GET[ 'result' ] ) && $_GET[ 'result' ] != '' ? $_GET[ 'result' ] : 'content';
    $this->viewName   = isset( $_GET[ 'view' ] ) ? $_GET[ 'view' ] : $this->config->defaultView;
    $this->objectId   = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : '';
    $this->viewObject = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'views/' . ucfirst( $this->viewName ) . '.json' );
    $this->className  = $this->viewObject->class;
    $this->templates  = $this->viewObject->templates;
    $this->actions    = $this->viewObject->actions;

    if( ! in_array( $this->role, $this->viewObject->roles ) ) {
      header( 'Location: index.php?view=' . $this->config->defaultView );

      return '';
    }

    return $this->renderView();
  }

  public function json() : string {
    return '';
  }

  private function renderView() : string {
    $strContent = '';

    $this->presentationObject->assignTemplateVar( 'fields', 'default', null, json_encode( BaseObject::fields( $this->className ) ) );
    $this->presentationObject->assignTemplateVar( 'view', 'default', null, json_encode( $this->viewObject ) );
    $this->presentationObject->assignTemplateVar( 'class', 'default', null, $this->className );
    $this->presentationObject->assignTemplateVar( 'id', 'default', null, isset( $strId ) ? $strId : '' );

    for( $i = 0; $i < count( $this->templates ); $i++ ) {
      $strContent .= $this->presentationObject->processTemplate( $this->templates[ $i ] );
    }

    $this->executeActions();

    return $strContent;
  }

  private function executeActions() : void {
    for( $i = 0; $i < count($this->actions ); $i++ ) {
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