import { showProfitMaxList } from "../messages/profitmax"
import { readDataJson } from "../utils"

export const getProfitMaxConfig = async (userId: number) => {
    const data = await readDataJson()
    return showProfitMaxList(data[userId]['profitMaxList'])
}
