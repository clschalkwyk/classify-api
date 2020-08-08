export class NewAdvertDto{
  type: string;
  description: string;
  askingPrice: number;
  stat: object;
  street1: string;
  street2: string;
  suburb: string;
  city: string;
  postcode: string;
  advertType: string;
  propertyType: string;
  province: string;
  country: string;
  title: string;

  /*"stat": {
    "count": {
      "bedrooms": "3",
      "bathrooms": "2",
      "lounges": "1",
      "kitchen": "1",
      "garage": "1"
    },
    "has": {
      "alarm": true,
      "pet_friendly": true
    },
    "size": {
      "erf_size": "365",
      "floor_area": "200"
    }
  },
*/
}