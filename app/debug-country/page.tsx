import { getUserLocation } from "@/lib/location";
import { getAllGiftCards } from "@/lib/queries";

export default async function DebugCountryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const userLocation = await getUserLocation();
  
  const override = typeof resolvedSearchParams.countryCode === 'string' 
    ? resolvedSearchParams.countryCode 
    : undefined;
  
  const code = (override || userLocation.countryCode).toUpperCase();
  
  const paramsWithLocation = {
    ...resolvedSearchParams,
    countryCode: code,
  };
  
  const allGiftCards = await getAllGiftCards(paramsWithLocation);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Country Detection</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Detected Location:</h2>
          <pre>{JSON.stringify(userLocation, null, 2)}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Final Country Code Used:</h2>
          <pre>{code}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Search Params:</h2>
          <pre>{JSON.stringify(paramsWithLocation, null, 2)}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Gift Cards Found:</h2>
          <pre>{allGiftCards.length}</pre>
        </div>
        
        {allGiftCards.length > 0 && (
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-bold">First 5 cards:</h2>
            <ul className="list-disc pl-5 mt-2">
              {allGiftCards.slice(0, 5).map((card) => (
                <li key={card._id}>
                  {card.brand} - {card.countryCode}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
