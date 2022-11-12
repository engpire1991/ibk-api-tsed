import { EntityRepository } from "typeorm";
import { SettingKeys } from "../constants/SettingKeys";
import { Setting } from "../entities/Setting";
import { RepositoryExtender } from "../extenders/RepositoryExtender";
import { isEmpty } from "../utils/Basic";
import QueryTransaction from "../utils/QueryTransaction";

const DEFAULT_EXPIRATION_TIME = 1800;

@EntityRepository(Setting)
export class SettingRepository extends RepositoryExtender<Setting> {

  public async getMaxProcessingCount(): Promise<number> {
    const setting = await this.findOne(SettingKeys.MAX_DOCUMENT_PROCESSING_COUNT);
    const defValue = 10;
    if (!setting || !setting.value) return defValue;

    const asNum = Number(setting.value);
    if (asNum && !isNaN(asNum)) return asNum;
    return defValue;
  }

  public async getInactivityLogout(): Promise<number> {
    const setting = await this.findOne(SettingKeys.INACTIVITY_LOGOUT);
    // return nothing if setting has no value
    if (!setting || isEmpty(setting.value)) return DEFAULT_EXPIRATION_TIME;

    const asNumber = Number(setting.value);
    return isNaN(asNumber) ? DEFAULT_EXPIRATION_TIME : asNumber;
  }

  public async getLowQualityDivider(): Promise<number> {
    const setting = await this.findOne(SettingKeys.LOW_QUALITY_DIVIDER);
    // default to 1.5 if setting is not set
    if (!setting || !setting.value) return 1.5;

    // get number version of the value
    const asNum = Number(setting.value);

    // default to 1.5 if number could not be parsed
    if (!asNum && isNaN(asNum)) return 1.5;
    
    return asNum;
  }

  public async generateDocumentNumber(queryTransaction: QueryTransaction): Promise<string> {

    // throw error if query transaction is not set
    if (!queryTransaction) throw new Error(`queryTransaction must be provided when generating document number`);
    // throw error if query transaction is not active
    if (!queryTransaction.isActive) throw new Error(`queryTransaction must be started when generating document number`);

    // get current counter and prefix
    let counterSetting = await this.repoManager(queryTransaction).createQueryBuilder("s")
      .where("s.key = :key", { key: SettingKeys.DOCUMENT_NUMBER_COUNTER })
      .setLock("pessimistic_write")
      .getOne();

    // create new instance if setting is not created yet
    let save: (keyof Setting)[] | undefined = ["value"];
    if (!counterSetting) {
      counterSetting = new Setting();
      counterSetting.key = SettingKeys.DOCUMENT_NUMBER_COUNTER;
      counterSetting.value = "0000000";
      save = undefined;
    }

    let counter = Number(counterSetting.value);

    // add 1 to counter and update settings table
    counter += 1;
    counterSetting.value = counter.toString();

    // add required zeros
    if (counterSetting.value.length < 7) {
      while (counterSetting.value.length < 7) counterSetting.value = "0" + counterSetting.value;
    }
    counterSetting = await this.saveOrUpdate(counterSetting, save, queryTransaction);

    return counterSetting.value;
  }
}