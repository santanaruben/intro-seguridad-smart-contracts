const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Ejercicio 0", function () {
  // Cantidad inicial de 1 millón de tokens (1000000 * 10^18)
  const INITIAL_SUPPLY = ethers.utils.parseUnits("1000000", "ether");

  let deployer, usuario, otroUsuario;

  beforeEach(async function () {
    [deployer, usuario, otroUsuario] = await ethers.getSigners();

    const BasicToken = await ethers.getContractFactory("BasicToken", deployer);

    this.token = await BasicToken.deploy(INITIAL_SUPPLY);
  });

  describe("Inicialización", function () {
    it("La cuenta minter es el deployer", async function () {
      expect(await this.token.minter()).to.eq(deployer.address);
    });

    it("El total supply del token es el esperado", async function () {
      expect(await this.token.totalSupply()).to.eq(INITIAL_SUPPLY);
    });

    it("Todo el total supply es asignado al deployer", async function () {
      expect(await this.token.balanceOf(deployer.address)).to.eq(
        INITIAL_SUPPLY
      );
    });
  });

  describe("Transferencias", function () {
    it("Un usuario sin fondos no puede transferir", async function () {
      expect(await this.token.balanceOf(usuario.address)).to.eq(0);
      await expect(this.token.connect(usuario).transfer(otroUsuario.address, 1))
        .to.be.reverted;
    });

    it("Un usuario con fondos puede transferir", async function () {
      expect(await this.token.balanceOf(deployer.address)).to.be.gt(0);
      await this.token.transfer(usuario.address, 1);
      expect(await this.token.balanceOf(usuario.address)).to.eq(1);
    });
  });

  describe("Minting", function () {
    it("Un usuario sin permisos no puede mintear tokens", async function () {
      await expect(
        this.token.connect(usuario).mint(otroUsuario.address, 100)
      ).to.be.revertedWith("No permitido");
    });

    it("Un usuario con permisos puede mintear tokens", async function () {
      await this.token.mint(otroUsuario.address, 100);
    });
  });
});
