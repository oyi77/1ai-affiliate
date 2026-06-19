<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution;

/**
 * Enumerates the supported attribution model strategies.
 */
enum ModelType: string
{
    case LAST_TOUCH = 'last_touch';
    case FIRST_TOUCH = 'first_touch';
    case LINEAR = 'linear';
    case TIME_DECAY = 'time_decay';
    case POSITION_BASED = 'position_based';
    case ALGORITHMIC = 'algorithmic';
    case ASSISTED = 'assisted';

    /**
     * Returns a human-friendly label for UI presentation.
     */
    public function label(): string
    {
        return match ($this) {
            self::LAST_TOUCH   => 'Last Touch',
            self::FIRST_TOUCH  => 'First Touch',
            self::LINEAR       => 'Linear',
            self::TIME_DECAY   => 'Time Decay',
            self::POSITION_BASED => 'Position Based',
            self::ALGORITHMIC  => 'Algorithmic',
            self::ASSISTED     => 'Assisted Conversions',
        };
    }

    /**
     * Indicates whether the strategy expects weighting configuration data.
     */
    public function requiresWeighting(): bool
    {
        return match ($this) {
            self::LAST_TOUCH, self::FIRST_TOUCH, self::LINEAR, self::ASSISTED => false,
            self::TIME_DECAY, self::POSITION_BASED, self::ALGORITHMIC => true,
        };
    }
}
