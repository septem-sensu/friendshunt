<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/includes/classes/controller.php' );



$objController = new Controller();
echo $objController->view();

// EOF