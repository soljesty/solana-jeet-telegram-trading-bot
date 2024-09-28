import { showProfitMaxList } from "../messages/profitmax"
import { readDataJson } from "../utils"
import fs from 'fs'
import { runProfitMaxiMode } from "../utils/runProfitMaxiMode"

// Show profit maxi mode list
export const getProfitMaxConfig = async (userId: string) => {
    const data = await readDataJson()
    console.log(data)
    if (data[userId] && data[userId]['profitMaxList']) {
        return showProfitMaxList(data[userId]['profitMaxList']);
    }
    return showProfitMaxList([]); // Return an empty list or handle the case where the user has no profitMaxList
}

// Show profit maxi mode temp item
export const getProfitMaxTempItem = async (key: string) => {
    const data = await readDataJson()
    let item: any
    if ('tempProfitMaxiModeItem' in data[key]) item = data[key]['tempProfitMaxiModeItem']
    else {
        data[key].tempProfitMaxiModeItem = {};
        item = {}
    }
    const title = `Enter a token info to add\nAddress: ${item?.address ?? '-'} \nPrice: ${item?.price ?? '-'}`
    const content = [[
        { text: "Address", callback_data: "Add_Address" },
        { text: "Price", callback_data: "Add_Price" },
    ]]
    if (item?.address && item?.price) content.push([
        { text: "Add to list", callback_data: "Temp_To_List" },
    ])

    return { title, content }
}

// Add temp item to main list
export const addTempToList = async (userId: string) => {
    const data = await readDataJson()
    const tempItem = data[userId]['tempProfitMaxiModeItem']
    if (tempItem.address && tempItem.name && tempItem.symbol && tempItem.price) {
        const isDuplicate = data[userId]["profitMaxList"].some((item: any) => item.address === tempItem.address);
        if (isDuplicate) {
            return { success: false, message: `Address <code>${tempItem.address}</code> already exists.` };
        }
        data[userId]['tempProfitMaxiModeItem'] = {}
        data[userId]["profitMaxList"].push(tempItem)
        await runProfitMaxiMode(tempItem.address, tempItem.price)
        fs.writeFileSync("data.json", JSON.stringify(data, null, 2), "utf8");
        return { success: true, message: `Sucessfully added.` };
    } else {
        return { success: false, message: `No temporaliy data ready` };
    }
}

// Add address to temp list
export const addProfitMaxAddress = async (
    address: string,
    name: string,
    symbol: string,
    key: string // Change this to string
) => {
    const data = JSON.parse(fs.readFileSync("data.json", "utf8"));

    // Check if the user exists in the data
    if (!data[key]) { // Check against the string key
        return { success: false, message: `You are not registered.` };
    }

    // Now we can safely check for profitMaxList
    if ("profitMaxList" in data[key]) {
        const isDuplicate = data[key]["profitMaxList"].some((item: any) => item.address === address);
        if (isDuplicate) {
            return { success: false, message: `Address <code>${address}</code> already exists.` };
        }
    }
    data[key]["tempProfitMaxiModeItem"] = {
        ...data[key]["tempProfitMaxiModeItem"],
        address,
        name,
        symbol
    };
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2), "utf8");
    return { success: true, message: `Address <code>${address}</code> has been added.` };
}

// Add price to temp list
export const addProfitMaxPrice = (
    price: number,
    key: string // Change this to string
) => {
    const data = JSON.parse(fs.readFileSync("data.json", "utf8"));

    // Check if the user exists in the data
    if (!data[key]) { // Check against the string key
        return { success: false, message: `You are not registered.` };
    }

    data[key]["tempProfitMaxiModeItem"] = {
        ...data[key]["tempProfitMaxiModeItem"],
        price,
    };
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2), "utf8");
    return { success: true, message: `Price <code>${price}</code> has been added.` };
}

// Remove item from profit maxi list
export const removeProfitMaxItem = async (address: string, key: number) => {
    const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
    if (data[key]) {
        if ("profitMaxList" in data[key]) {
            const isExist = data[key]["profitMaxList"].some(
                (item: any) => item.address === address
            );
            if (!isExist) {
                return {
                    success: false,
                    message: `Address <code>${address}</code> has not exist`,
                };
            } else {
                data[key].profitMaxList = data[key].profitMaxList.filter(
                    (item: any) => item.address !== address
                );
                fs.writeFileSync("data.json", JSON.stringify(data, null, 2), "utf8");
                return {
                    success: true,
                    message: `Address <code>${address}</code> has been removed.`,
                };
            }
        } else {
            return {
                success: false,
                message: `Address <code>${address}</code> has not exist.`,
            };
        }
    } else {
        return { success: false, message: `You are not registered.` };
    }
}
