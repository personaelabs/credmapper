import { ContractType } from '../types';
import CONTRACTS from './allContracts';

const ERC20_CONTRACTS = CONTRACTS.filter((contract) => contract.type === ContractType.ERC20);

export default ERC20_CONTRACTS;
