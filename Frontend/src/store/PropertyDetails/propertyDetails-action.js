import{propertDetailsAction} from "./propertyDetails-slice";
import {axiosInstance} from "../../utils/axios"

// fetch details of one specific property using its id

//recv property id
// start loading
//call backend api
//wait for response
//get the property data
//store details in redux
// If error store error in redux


export const getPropertyDetails =(id) => async(dispatch) =>{
    try{
     dispatch(propertDetailsAction.getListRequest());
     const response = await axiosInstance(`/v1/rent/listing/${id}`)
     console.log(response);
     if(!response){
        throw new Error ("Could not fetch any propertyDetails")
     }

     const{data} = response.data;
     dispatch(propertDetailsAction.getPropertyDetails(data))
    }catch(error){
     dispatch(propertDetailsAction.getErrors(error.response.data.error))
    }
}