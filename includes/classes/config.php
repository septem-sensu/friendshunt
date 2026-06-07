<?php

declare( strict_types = 1 );

class Config {
  const PASSPHRASE1 = '{{PASSPHRASE1}}';
  const PASSPHRASE2 = '{{PASSPHRASE2}}';

  public static function getPassphrase1() : string { return self::PASSPHRASE1; }
  public static function getPassphrase2() : string { return self::PASSPHRASE2; }
}

// EOF
