import { expect } from "chai";
import { ethers, network, waffle } from "hardhat";
import DogeSoundClubMateArtifact from "../artifacts/contracts/DogeSoundClubMate.sol/DogeSoundClubMate.json";
import DSCVoteArtifact from "../artifacts/contracts/DSCVote.sol/DSCVote.json";
import { DogeSoundClubMate } from "../typechain/DogeSoundClubMate";
import { DSCVote } from "../typechain/DSCVote";

const { deployContract } = waffle;

async function mine(count = 1): Promise<void> {
    expect(count).to.be.gt(0);
    for (let i = 0; i < count; i += 1) {
        await ethers.provider.send("evm_mine", []);
    }
}

describe("DSCVote", () => {
    let mates1: DogeSoundClubMate;
    let mates2: DogeSoundClubMate;
    let vote: DSCVote;

    const provider = waffle.provider;
    const [admin, other] = provider.getWallets();

    beforeEach(async () => {

        mates1 = await deployContract(
            admin,
            DogeSoundClubMateArtifact,
            []
        ) as DogeSoundClubMate;

        mates2 = await deployContract(
            admin,
            DogeSoundClubMateArtifact,
            []
        ) as DogeSoundClubMate;

        vote = await deployContract(
            admin,
            DSCVoteArtifact,
            []
        ) as DSCVote;

        await vote.allowMates(mates1.address);
        await vote.allowMates(mates2.address);
        await mates1.setApprovalForAll(vote.address, true);
    })

    context("new DSCVote", async () => {
        it("has given data", async () => {
            expect(await vote.VOTING()).to.be.equal(0)
            expect(await vote.CANCELED()).to.be.equal(1)
            expect(await vote.RESULT_SAME()).to.be.equal(2)
            expect(await vote.RESULT_FOR()).to.be.equal(3)
            expect(await vote.RESULT_AGAINST()).to.be.equal(4)
        })

        it("propose", async () => {

            for (let i = 0; i < 25; i += 1) {
                await mates1.mint(admin.address, i);
            }

            await vote.setMinProposePeriod(10);

            await expect(vote.propose(
                "제목1",
                "요약1",
                "내용1",
                "비고1",
                10,
                mates1.address,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            ))
                .to.emit(vote, "Propose")
                .withArgs(0, admin.address, mates1.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24])

            expect((await vote.proposals(0))[1]).to.be.equal("제목1")
            expect((await vote.proposals(0))[2]).to.be.equal("요약1")
            expect((await vote.proposals(0))[3]).to.be.equal("내용1")
            expect(await vote.result(0)).to.be.equal(await vote.VOTING())

            await mine(10);
            await vote.getBackMates(0);

            await expect(vote.propose(
                "제목2",
                "요약2",
                "내용2",
                "비고2",
                604800,
                mates1.address,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            ))
                .to.emit(vote, "Propose")
                .withArgs(1, admin.address, mates1.address, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24])

            expect((await vote.proposals(1))[1]).to.be.equal("제목2")
            expect((await vote.proposals(1))[2]).to.be.equal("요약2")
            expect((await vote.proposals(1))[3]).to.be.equal("내용2")
            expect(await vote.result(1)).to.be.equal(await vote.VOTING())
        })

        it("vote for", async () => {

            for (let i = 0; i < 25; i += 1) {
                await mates1.mint(admin.address, i);
            }
            for (let i = 25; i < 30; i += 1) {
                await mates1.mint(other.address, i);
            }

            await vote.setMinProposePeriod(10);

            await vote.propose(
                "제목1",
                "요약1",
                "내용1",
                "비고1",
                10,
                mates1.address,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            );

            await expect(vote.connect(other).voteFor(0, mates1.address, [25, 26, 27, 28, 29]))
                .to.emit(vote, "VoteFor")
                .withArgs(0, other.address, mates1.address, [25, 26, 27, 28, 29])

            expect(await vote.result(0)).to.be.equal(await vote.VOTING())

            await mine(10);

            expect(await vote.result(0)).to.be.equal(await vote.RESULT_FOR())
        })

        it("vote against", async () => {

            for (let i = 0; i < 25; i += 1) {
                await mates1.mint(admin.address, i);
            }
            for (let i = 25; i < 30; i += 1) {
                await mates1.mint(other.address, i);
            }

            await vote.setMinProposePeriod(10);

            await vote.propose(
                "제목1",
                "요약1",
                "내용1",
                "비고1",
                10,
                mates1.address,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            );

            await expect(vote.connect(other).voteAgainst(0, mates1.address, [25, 26, 27, 28, 29]))
                .to.emit(vote, "VoteAgainst")
                .withArgs(0, other.address, mates1.address, [25, 26, 27, 28, 29])

            expect(await vote.result(0)).to.be.equal(await vote.VOTING())

            await mine(10);

            expect(await vote.result(0)).to.be.equal(await vote.RESULT_AGAINST())
        })

        it("cancel", async () => {

            for (let i = 0; i < 25; i += 1) {
                await mates1.mint(admin.address, i);
            }
            for (let i = 25; i < 30; i += 1) {
                await mates1.mint(other.address, i);
            }

            await vote.setMinProposePeriod(10);

            await vote.propose(
                "제목1",
                "요약1",
                "내용1",
                "비고1",
                10,
                mates1.address,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            );

            await expect(vote.cancel(0))
                .to.emit(vote, "Cancel")
                .withArgs(0)

            await expect(vote.connect(other).voteAgainst(0, mates1.address, [25, 26, 27, 28, 29]))
                .to.reverted;

            expect(await vote.result(0)).to.be.equal(await vote.CANCELED())

            expect((await vote.proposals(0))[8]).to.be.equal(true)
        })

        it("execute", async () => {

            for (let i = 0; i < 25; i += 1) {
                await mates1.mint(admin.address, i);
            }
            for (let i = 25; i < 30; i += 1) {
                await mates1.mint(other.address, i);
            }

            await vote.setMinProposePeriod(10);

            await vote.propose(
                "제목1",
                "요약1",
                "내용1",
                "비고1",
                10,
                mates1.address,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            );

            await vote.connect(other).voteFor(0, mates1.address, [25, 26, 27, 28, 29])

            await mine(10);

            await expect(vote.execute(0))
                .to.emit(vote, "Execute")
                .withArgs(0)

            expect((await vote.proposals(0))[9]).to.be.equal(true)
        })

        it("get back mates", async () => {

            for (let i = 0; i < 25; i += 1) {
                await mates1.mint(admin.address, i);
            }
            for (let i = 25; i < 30; i += 1) {
                await mates1.mint(other.address, i);
            }

            await vote.setMinProposePeriod(10);

            await vote.propose(
                "제목1",
                "요약1",
                "내용1",
                "비고1",
                10,
                mates1.address,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            );

            await expect(vote.connect(other).voteFor(0, mates1.address, [25, 26, 27, 28, 29]))
                .to.emit(vote, "VoteFor")
                .withArgs(0, other.address, mates1.address, [25, 26, 27, 28, 29])

            expect(await vote.result(0)).to.be.equal(await vote.VOTING())

            await mine(10);

            expect(await vote.result(0)).to.be.equal(await vote.RESULT_FOR())
            
            expect(await mates1.balanceOf(admin.address)).to.be.equal(0)
            expect(await vote.matesBacked(0)).to.be.equal(false)
            await vote.getBackMates(0);
            expect(await vote.matesBacked(0)).to.be.equal(true)
            expect(await mates1.balanceOf(admin.address)).to.be.equal(25)
        })
    })
})