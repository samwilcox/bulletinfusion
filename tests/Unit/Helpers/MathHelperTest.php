<?php

/**
 * BULLETIN FUSION
 * 
 * By Sam Wilcox <sam@bulletinfusion.com>
 * https://www.bulletinfusion.com
 * 
 * This software is released under the MIT license.
 * For further details, visit:
 * https://license.bulletinfusion.com
 */

namespace BulletinFusion\Tests\Helpers;

use PHPUnit\Framework\TestCase;
use BulletinFusion\Helpers\MathHelper;

/**
 * Unit tests for verifying MathHelper functions as intended.
 */
class MathHelperTest extends TestCase {
    /**
     * Executes before each test.
     * @return void
     */
    protected function setUp(): void {
        define('BF_RUNTIME', true);
    }

    /**
     * Tests that the FormatNumber() method returns an unformatted value.
     * @return void
     */
    public function testFormatNumberNoFormat() {
        $this->assertEquals(876, MathHelper::formatNumber(876));
    }

    /**
     * Tests that the FormatNumber() method returns an unformatted value
     * of 0.
     *
     * @return void
     */
    public function testFormatNumberZero() {
        $this->assertEquals(0, MathHelper::formatNumber(0));
    }

    /**
     * Tests that the FormatNumber() method returns the correct number format
     * string for in the thousands.
     * @return void
     */
    public function testFormatNumberThousands() {
        $this->assertEquals('25.6K', MathHelper::formatNumber(25600));
    }

    /**
     * Tests the the FormatNumber() method returns the correct number format
     * string for in the millions.
     * @return void
     */
    public function testFormatNumberMillions() {
        $this->assertEquals('115.2M', MathHelper::formatNumber(115200000));
    }

    /**
     * Tests the FormatNumber() method returns the correct number format
     * string for in the billions.
     * @return void
     */
    public function testFormatNumberBillions() {
        $this->assertEquals('2.9B', MathHelper::formatNumber(2900000000));
    }

    /**
     * Tests the FormatNumber() method returns the correct number format
     * string for in the trillions.
     * @return void
     */
    public function testFormatNumberTrillions() {
        $this->assertEquals('675.1T', MathHelper::formatNumber(675100000000000));
    }

    /**
     * Tests that FormatNumber() method returns the correct number format for
     * random values.
     * @return void
     */
    public function testFormatNumberRandoms() {
        $randValues = $this->generateRandomValues(500);

        foreach ($randValues as $number => $formatted) {
            $this->assertEquals($formatted, MathHelper::formatNumber($number));
        }
    }

    /**
     * Helper method that formats a given number to test against the actual
     * FormatNumber() method in the MathHelper.
     * @param integer $number - The number to format.
     * @param integer [$decimals=2] - The total decimal places.
     * @return string - Formatted number string.
     */
    private function formatNumber($number, $decimals = 2) {
        if ($number < 1000) {
            return $number;
        } elseif ($number < 1000000) {
            return self::formatWithDecimalPlaces($number / 1000, $decimals, 1) . 'K';
        } elseif ($number < 1000000000) {
            return self::formatWithDecimalPlaces($number / 1000000, $decimals, 1) . 'M';
        } elseif ($number < 1000000000000) {
            return self::formatWithDecimalPlaces($number / 1000000000, $decimals, 1) . 'B';
        } else {
            return self::formatWithDecimalPlaces($number / 1000000000000, $decimals, 1) . 'T';
        }
    }

    /**
     * Helper method that formats a given number to set amount of decimal places.
     * @param float $number - Number to format.
     * @param integer $decimals - Total decimal places.
     * @param integer [$minDecimalPlaces=2] - Minimum decimal places to format with.
     * @return string - Formatted string
     */
    private function formatWithDecimalPlaces($number, $decimals, $minDecimalPlaces = 2) {
        $formattedNumber = \number_format($number, $decimals);

        if ($decimals === 2 && \substr($formattedNumber, -1) === '0') {
            return \number_format($number, $minDecimalPlaces);
        }

        return $formattedNumber;
    }

    /**
     * Helper method that generates random values from the thousands to the
     * trillions.
     * @param integer $count - The total random items to generate.
     * @return array - The random items collection.
     */
    private function generateRandomValues($count) {
        $values = [];

        for ($i = 0; $i < $count; $i++) {
            $number = mt_rand(1_000, 1_000_000_000_000);
            $formatted = $this->formatNumber($number);
            $values[$number] = $formatted;
        }

        return $values;
    }
}