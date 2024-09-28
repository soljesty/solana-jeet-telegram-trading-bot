import { showProfitMaxList } from "../messages/profitmax"
import { readDataJson } from "../utils"

export const getProfitMaxConfig = async (userId: number) => {
    const data = await readDataJson();
    if (!data[userId] || !data[userId]['profitMaxList']) {
        return showProfitMaxList([]); // Return an empty list or handle the case where the user has no profitMaxList
    }
    return showProfitMaxList(data[userId]['profitMaxList']);
}
