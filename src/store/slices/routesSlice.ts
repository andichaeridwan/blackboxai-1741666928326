import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RoutesState, Route } from '../../types';

const initialState: RoutesState = {
  routes: [],
  favorites: [],
  selectedRoute: null,
  loading: false,
  error: null,
};

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setRoutes: (state, action: PayloadAction<Route[]>) => {
      state.routes = action.payload;
    },
    updateRoutes: (state, action: PayloadAction<(routes: Route[]) => Route[]>) => {
      state.routes = action.payload(state.routes);
    },
    setSelectedRoute: (state, action: PayloadAction<Route | null>) => {
      state.selectedRoute = action.payload;
    },
    updateSelectedRoute: (state, action: PayloadAction<(route: Route | null) => Route | null>) => {
      state.selectedRoute = action.payload(state.selectedRoute);
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      state.favorites.push(action.payload);
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRoutes,
  updateRoutes,
  setSelectedRoute,
  updateSelectedRoute,
  addFavorite,
  removeFavorite,
  setLoading,
  setError,
} = routesSlice.actions;

export const routesReducer = routesSlice.reducer;
