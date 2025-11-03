import { useState, useEffect, useCallback } from "react";
import recipeService from "../services/recipeService";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = "recipes_cache_";

/**
 * Get cache key for given params
 */
function getCacheKey(params) {
  return CACHE_KEY_PREFIX + btoa(JSON.stringify(params));
}

/**
 * Check if cache is valid
 */
function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Get cached data
 */
function getCachedData(cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (!isCacheValid(timestamp)) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Error reading cache:", error);
    return null;
  }
}

/**
 * Set cached data
 */
function setCachedData(cacheKey, data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Error writing cache:", error);
  }
}

/**
 * Custom hook for fetching recipes with caching
 * @param {Object} params - Query parameters
 * @returns {Object} - { recipes, loading, error, pagination, refetch, isFromCache }
 */
export function useRecipes(params = {}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchRecipes = useCallback(
    async (forceRefresh = false) => {
      const cacheKey = getCacheKey(params);

      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setRecipes(cachedData.data || []);
          setPagination(cachedData.pagination || null);
          setIsFromCache(true);
          setLoading(false);
          setError(null);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);
        setIsFromCache(false);

        const response = await recipeService.getRecipes(params);

        if (response.success) {
          const data = {
            data: response.data || [],
            pagination: response.pagination || null,
          };

          setRecipes(data.data);
          setPagination(data.pagination);

          // Cache the successful response
          setCachedData(cacheKey, data);
        } else {
          setError(response.message || "Failed to fetch recipes");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching recipes");
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)]
  );

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    pagination,
    isFromCache,
    refetch: () => fetchRecipes(true), // Force refresh bypasses cache
  };
}

/**
 * Custom hook for fetching a single recipe
 * @param {string} id - Recipe ID
 * @returns {Object} - { recipe, loading, error, refetch }
 */
export function useRecipe(id) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await recipeService.getRecipeById(id);

      if (response.success) {
        setRecipe(response.data);
      } else {
        setError(response.message || "Failed to fetch recipe");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching recipe");
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return {
    recipe,
    loading,
    error,
    refetch: fetchRecipe,
  };
}
