// src/components/common/FavoriteButton.jsx
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import favoriteService from '../../services/favoriteService';
import userService from '../../services/userService';

/**
 * FavoriteButton Component
 * Toggles favorite status with API and localStorage support
 */
export default function FavoriteButton({ recipeId, onToggle, showCount = false, initialCount = 0, size = 'md' }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Size variants
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Check if recipe is favorited on mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorited(favorites.includes(recipeId));
  }, [recipeId]);

  const handleToggle = async (e) => {
    e.stopPropagation(); // Prevent card click

    if (isLoading) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    setIsLoading(true);

    try {
      const userIdentifier = userService.getUserIdentifier();
      const response = await favoriteService.toggleFavorite({
        recipe_id: recipeId,
        user_identifier: userIdentifier,
      });

      if (response.success) {
        // Update localStorage for UI state
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(recipeId);

        let newFavoritedState;
        if (isFavorited) {
          // Remove from favorites
          if (index > -1) {
            favorites.splice(index, 1);
          }
          newFavoritedState = false;
          setFavoriteCount(prev => Math.max(0, prev - 1));
        } else {
          // Add to favorites
          if (index === -1) {
            favorites.push(recipeId);
          }
          newFavoritedState = true;
          setFavoriteCount(prev => prev + 1);
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        setIsFavorited(newFavoritedState);

        // Call parent callback if provided
        if (onToggle) {
          onToggle(recipeId, newFavoritedState);
        }
      } else {
        console.error('Failed to toggle favorite:', response.message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizes[size]} rounded-full flex items-center justify-center gap-1.5
        transition-all duration-200
        ${isFavorited
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-red-500'
        }
        backdrop-blur-sm shadow-md hover:shadow-lg
        ${isAnimating ? 'scale-125' : 'scale-100'}
        group
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`
          ${iconSizes[size]}
          transition-all duration-200
          ${isFavorited ? 'fill-current' : ''}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      />
      {showCount && favoriteCount > 0 && (
        <span className="text-xs font-semibold">
          {favoriteCount > 999 ? '999+' : favoriteCount}
        </span>
      )}
    </button>
  );
}
