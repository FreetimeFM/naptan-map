# NaPTAN Map
NaPTAN (short for National Public Transport Access Node) is a dataset containing the location and information of public transport access points in the United Kingdom. [Wikipedia](https://en.wikipedia.org/wiki/NaPTAN).

This project displays the NaPTAN data on an OpenStreetMap layer. It allows users to see the locations and information of access points. Check out the website at [naptan-map.vercel.app](https://naptan-map.vercel.app/).

## How to use

1. Go to [beta-naptan.dft.gov.uk/Download/La](https://beta-naptan.dft.gov.uk/Download/La).
2. Use the search bar to select data for a local authority and then click "Add".
3. Select **CSV** as the file type and then click "Download".
4. Go to the [naptan-map](https://naptan-map.vercel.app/) site.
5. Upload the csv file and then click "Submit".
    - If the file size is large, it may take some time to process the data.
5. There should be circle markers denoting the locations of access points.
    - You can click on the markers to see more information about them.
    - Blue markers mean that the access point is active while orange markers show inactive ones.
    - You can click the "Clear Map" button to remove the data from the map.

All the data is processed in the browser.