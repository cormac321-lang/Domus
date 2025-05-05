import React, { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext();

const initialState = {
  properties: [],
  maintenance: [],
  inventory: [],
  budget: [],
  calendar: [],
  chat: [],
  templates: [],
  user: null,
  loading: {
    properties: false,
    maintenance: false,
    inventory: false,
    budget: false,
    calendar: false,
    chat: false,
  },
  error: {
    properties: null,
    maintenance: null,
    inventory: null,
    budget: null,
    calendar: null,
    chat: null,
  },
};

function appReducer(state, action) {
  switch (action.type) {
    // Loading states
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    
    // Error states
    case 'SET_ERROR':
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.key]: action.payload.value,
        },
      };

    // Properties
    case 'SET_PROPERTIES':
      return { 
        ...state, 
        properties: action.payload,
        loading: { ...state.loading, properties: false },
        error: { ...state.error, properties: null },
      };
    case 'ADD_PROPERTY':
      return { 
        ...state, 
        properties: [...state.properties, action.payload],
        loading: { ...state.loading, properties: false },
        error: { ...state.error, properties: null },
      };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
        loading: { ...state.loading, properties: false },
        error: { ...state.error, properties: null },
      };
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== action.payload),
        loading: { ...state.loading, properties: false },
        error: { ...state.error, properties: null },
      };

    // Maintenance
    case 'SET_MAINTENANCE':
      return { 
        ...state, 
        maintenance: action.payload,
        loading: { ...state.loading, maintenance: false },
        error: { ...state.error, maintenance: null },
      };
    case 'ADD_MAINTENANCE':
      return { 
        ...state, 
        maintenance: [...state.maintenance, action.payload],
        loading: { ...state.loading, maintenance: false },
        error: { ...state.error, maintenance: null },
      };
    case 'UPDATE_MAINTENANCE':
      return {
        ...state,
        maintenance: state.maintenance.map(m =>
          m.id === action.payload.id ? action.payload : m
        ),
        loading: { ...state.loading, maintenance: false },
        error: { ...state.error, maintenance: null },
      };

    // Inventory
    case 'SET_INVENTORY':
      return { 
        ...state, 
        inventory: action.payload,
        loading: { ...state.loading, inventory: false },
        error: { ...state.error, inventory: null },
      };
    case 'ADD_INVENTORY':
      return { 
        ...state, 
        inventory: [...state.inventory, action.payload],
        loading: { ...state.loading, inventory: false },
        error: { ...state.error, inventory: null },
      };

    // Budget
    case 'SET_BUDGET':
      return { 
        ...state, 
        budget: action.payload,
        loading: { ...state.loading, budget: false },
        error: { ...state.error, budget: null },
      };
    case 'ADD_BUDGET':
      return { 
        ...state, 
        budget: [...state.budget, action.payload],
        loading: { ...state.loading, budget: false },
        error: { ...state.error, budget: null },
      };

    // Calendar
    case 'SET_CALENDAR':
      return { 
        ...state, 
        calendar: action.payload,
        loading: { ...state.loading, calendar: false },
        error: { ...state.error, calendar: null },
      };
    case 'ADD_CALENDAR':
      return { 
        ...state, 
        calendar: [...state.calendar, action.payload],
        loading: { ...state.loading, calendar: false },
        error: { ...state.error, calendar: null },
      };

    // Chat
    case 'SET_CHAT':
      return { 
        ...state, 
        chat: action.payload,
        loading: { ...state.loading, chat: false },
        error: { ...state.error, chat: null },
      };
    case 'ADD_CHAT':
      return { 
        ...state, 
        chat: [...state.chat, action.payload],
        loading: { ...state.loading, chat: false },
        error: { ...state.error, chat: null },
      };

    // User
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setLoading = useCallback((key, value) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  }, []);

  const setError = useCallback((key, value) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value } });
  }, []);

  const value = {
    state,
    dispatch,
    setLoading,
    setError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 