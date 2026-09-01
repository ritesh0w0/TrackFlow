export function getErrorMessage(error, fallbackMessage = 'An unexpected error occurred.') {
  if (!error) return fallbackMessage;

  // Check backend JSON response envelope
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // HTTP Status code fallbacks
  if (error.response?.status) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return 'Invalid request parameters. Please check your input.';
      case 401:
        return 'Session expired or unauthorized. Please log in again.';
      case 403:
        return 'Forbidden. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
      case 502:
      case 503:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status code ${status}.`;
    }
  }

  // Network / Connection errors
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'Network connection lost. Please check your internet connection.';
  }

  if (typeof error === 'string') return error;

  return fallbackMessage;
}
