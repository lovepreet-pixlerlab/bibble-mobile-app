import { useSelector } from 'react-redux';

export const useUser = () => {
    const { user, isAuthenticated } = useSelector((state: any) => state.user);

    return {
        user,
        isAuthenticated,
        userEmail: user?.email,
        userName: user?.name,
        isPaidReader: user?.paidReader,
        isEmailVerified: user?.isEmailVarify,
        userId: user?._id,
    };
};
