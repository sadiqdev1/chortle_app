<?php

namespace App\Enums;

enum MemeCategory: string
{
    case FUNNY        = 'Funny';
    case DARK_HUMOR   = 'Dark Humor';
    case WHOLESOME    = 'Wholesome';
    case TRENDING     = 'Trending';
    case SCHOOL       = 'School';
    case TECH         = 'Tech';
    case GAMING       = 'Gaming';
    case RELATIONSHIP = 'Relationship';
    case OTHER        = 'Other';

    public function label(): string
    {
        return match($this) {
            self::FUNNY        => '😂 Funny',
            self::DARK_HUMOR   => '💀 Dark Humor',
            self::WHOLESOME    => '🥹 Wholesome',
            self::TRENDING     => '🔥 Trending',
            self::SCHOOL       => '🎓 School',
            self::TECH         => '💻 Tech',
            self::GAMING       => '🎮 Gaming',
            self::RELATIONSHIP => '❤️ Relationship',
            self::OTHER        => '📦 Other',
        };
    }

    public function emoji(): string
    {
        return match($this) {
            self::FUNNY        => '😂',
            self::DARK_HUMOR   => '💀',
            self::WHOLESOME    => '🥹',
            self::TRENDING     => '🔥',
            self::SCHOOL       => '🎓',
            self::TECH         => '💻',
            self::GAMING       => '🎮',
            self::RELATIONSHIP => '❤️',
            self::OTHER        => '📦',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
