import axios from "axios";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const useAxiosSecure = () => {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  // interceptor

  // Response Interceptors
  axiosSecure.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      console.log(`Error from axios interceptor`, err.response);
      if (err.response.status === 401 || err.response.status === 403) {
        await logOut();
        navigate("/login");
      }
      return Promise.reject(err);
    }
  );

  // Request Interceptors
  // axios.interceptors.request;

  return axiosSecure;
};

export default useAxiosSecure;
