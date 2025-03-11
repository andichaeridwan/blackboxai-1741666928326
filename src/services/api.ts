import { auth, database } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { ref, get, set, onValue } from 'firebase/database';

// Authentication Services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }
};

// Routes Services
export const routesService = {
  getRoutes: async () => {
    try {
      const routesRef = ref(database, 'routes');
      const snapshot = await get(routesRef);
      return snapshot.val();
    } catch (error) {
      throw error;
    }
  },

  subscribeToVehicleUpdates: (vehicleId: string, callback: (data: any) => void) => {
    const vehicleRef = ref(database, `vehicleLocations/${vehicleId}`);
    return onValue(vehicleRef, (snapshot) => {
      callback(snapshot.val());
    });
  },

  getFavoriteRoutes: async (userId: string) => {
    try {
      const favoritesRef = ref(database, `users/${userId}/favorites`);
      const snapshot = await get(favoritesRef);
      return snapshot.val();
    } catch (error) {
      throw error;
    }
  },

  addFavoriteRoute: async (userId: string, routeId: string) => {
    try {
      const favoriteRef = ref(database, `users/${userId}/favorites/${routeId}`);
      await set(favoriteRef, true);
    } catch (error) {
      throw error;
    }
  }
};
