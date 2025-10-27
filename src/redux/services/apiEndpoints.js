const apiEndPointes = {
  // Authentication Endpoints
  login: '/auth/login',
  register: '/auth/register',
  verifyEmail: '/auth/verify-email',
  requestVerifyEmail: '/auth/request-verify-email',
  forgotPassword: '/auth/forgot-password',
  resetPasswordOtpVerify: '/auth/verify-otp-for-password-reset',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',

  // User Endpoints
  userLanguages: '/user/languages',
  userHymns: '/user/hymns',
  userSingleHymn: '/user/hymns', // For single hymn with productId in URL path
  userFavorites: '/user/favorites',
  userRemoveFavorite: '/user/favorites', // For removing favorite with favoriteId in URL path
  userStories: '/user/stories',
  userChapters: '/user/chapters', // For chapters with storyId in URL path
  userVerses: '/user/verses', // For verses with chapterId in URL path
  userSearch: '/user/search', // For search functionality

  // Payment Endpoints
  createOrder: '/user/create-order',
  verifyPayment: '/user/verify-payment',
};

export { apiEndPointes };
