import { showProfitMaxList } from "../messages/profitmax"
import { readDataJson } from "../utils"

export const getProfitMaxConfig = async (userId: string) => {
    const data = await readDataJson();
    if (!data.users[userId] || !data.users[userId]['profitMaxList']) {
        return showProfitMaxList([]); // Return an empty list or handle the case where the user has no profitMaxList
    }
    return showProfitMaxList(data.users[userId]['profitMaxList']);
}
