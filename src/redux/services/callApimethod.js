export async function callApiMethod(apiCall, onSucess, onError, payload = {}) {
  try {
    const apiResponse = await apiCall(payload);
    if (apiResponse?.data?.success) {
      onSucess(apiResponse?.data);
    } else if (!apiResponse?.data?.success || apiResponse?.error) {
      onError(apiResponse?.data?.message || apiResponse?.error);
    }
  } catch (err) {
    console.log('error in callApiMethod', err);
    onError(err);
  }
}
